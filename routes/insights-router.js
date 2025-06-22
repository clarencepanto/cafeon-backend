import { Router } from "express";
import db from "../db.js";
const router = Router();

router.get("/atv-change", async (req, res) => {
  const now = new Date();
  const currentHour = now.getHours();
  const prevHour = currentHour === 0 ? 23 : currentHour - 1;

  // Get today’s full date range (00:00 to 23:59) to keep queries accurate
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  try {
    // 🟢 Sales in the current hour
    const currentHourSales = await db("sales")
      .whereBetween("created_at", [todayStart, todayEnd])
      .andWhereRaw("HOUR(created_at) = ?", [currentHour])
      .select("total");

    // 🟡 Sales in the previous hour
    const prevHourSales = await db("sales")
      .whereBetween("created_at", [todayStart, todayEnd])
      .andWhereRaw("HOUR(created_at) = ?", [prevHour])
      .select("total");

    // 🔢 ATV Calculator
    const calcATV = (sales) => {
      const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
      const transactionCount = sales.length;
      return transactionCount === 0 ? 0 : totalRevenue / transactionCount;
    };

    const currentATV = calcATV(currentHourSales);
    const prevATV = calcATV(prevHourSales);

    let message = "Not enough data to compare.";
    if (prevATV > 0) {
      const change = ((currentATV - prevATV) / prevATV) * 100;
      message =
        change > 0
          ? `📈 ATV increased by ${change.toFixed(1)}% this hour.`
          : `📉 ATV decreased by ${Math.abs(change).toFixed(1)}% this hour.`;
    }

    res.json({
      currentATV: currentATV.toFixed(2),
      prevATV: prevATV.toFixed(2),
      insight: message,
    });

    console.log("🕐 Hour:", currentHour, "Prev:", prevHour);
    console.log("📅 Today Start:", todayStart.toISOString());
    console.log("📅 Today End:", todayEnd.toISOString());
    console.log("📊 Current Hour Sales:", currentHourSales);
    console.log("⏪ Prev Hour Sales:", prevHourSales);
  } catch (err) {
    console.error("❌ Error generating ATV insight:", err);
    res.status(500).json({ error: "Failed to generate ATV insight" });
  }
});

// GET /insights/revenue-change?range=day|week|month|year
router.get("/revenue-change", async (req, res) => {
  const { range = "day" } = req.query;

  const now = new Date();
  let currStart, currEnd, prevStart, prevEnd;

  switch (range) {
    case "week":
      // This week (7 days incl. today)
      currEnd = new Date(now);
      currEnd.setHours(23, 59, 59, 999);
      currStart = new Date(currEnd);
      currStart.setDate(currStart.getDate() - 6);

      // Previous week
      prevEnd = new Date(currStart);
      prevEnd.setDate(prevEnd.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 6);
      break;

    case "month":
      // Current month
      currStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      // Previous month
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;

    case "year":
      // Current year
      currStart = new Date(now.getFullYear(), 0, 1);
      currEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      // Previous year
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      break;

    default: // "day"
      currStart = new Date(now);
      currStart.setHours(0, 0, 0, 0);
      currEnd = new Date(now);
      currEnd.setHours(23, 59, 59, 999);

      prevStart = new Date(currStart);
      prevStart.setDate(prevStart.getDate() - 1);
      prevEnd = new Date(prevStart);
      prevEnd.setHours(23, 59, 59, 999);
      break;
  }

  try {
    // ✅ Get current period sales
    const currentSales = await db("sales")
      .whereBetween("created_at", [currStart, currEnd])
      .select("total");

    // ✅ Get previous period sales
    const previousSales = await db("sales")
      .whereBetween("created_at", [prevStart, prevEnd])
      .select("total");

    const calcTotal = (sales) =>
      sales.reduce((sum, s) => sum + Number(s.total), 0);

    const currentTotal = calcTotal(currentSales);
    const previousTotal = calcTotal(previousSales);

    let message = "Not enough data to compare.";

    if (previousTotal > 0) {
      const change = ((currentTotal - previousTotal) / previousTotal) * 100;
      const label =
        range === "day"
          ? "Today"
          : range === "week"
          ? "This week"
          : range === "month"
          ? "This month"
          : "This year";

      message =
        change > 0
          ? `🚀 ${label}'s revenue ($${currentTotal.toFixed(
              2
            )}) is up ${change.toFixed(1)}% vs last ${range}.`
          : `📉 ${label}'s revenue ($${currentTotal.toFixed(
              2
            )}) is down ${Math.abs(change).toFixed(1)}% vs last ${range}.`;
    }

    res.json({
      current: currentTotal.toFixed(2),
      previous: previousTotal.toFixed(2),
      insight: message,
    });
  } catch (err) {
    console.error("❌ Error generating revenue insight:", err);
    res.status(500).json({ error: "Failed to generate revenue insight" });
  }
});

router.get("/best-product", async (req, res) => {
  try {
    const now = new Date();

    // 📆 Get full-day boundaries for today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // 📆 Get full-day boundaries for yesterday
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(todayEnd.getDate() - 1);

    // 📊 Get today's top-selling product
    const todayTop = await db("sale_items")
      .join("sales", "sales.id", "sale_items.sale_id")
      .join("products", "products.id", "sale_items.product_id")
      .whereBetween("sales.created_at", [todayStart, todayEnd])
      .select("products.name")
      .sum("sale_items.quantity as total_sold")
      .groupBy("products.name")
      .orderBy("total_sold", "desc")
      .first();

    // 📊 Get yesterday's top-selling product
    const yesterdayTop = await db("sale_items")
      .join("sales", "sales.id", "sale_items.sale_id")
      .join("products", "products.id", "sale_items.product_id")
      .whereBetween("sales.created_at", [yesterdayStart, yesterdayEnd])
      .select("products.name")
      .sum("sale_items.quantity as total_sold")
      .groupBy("products.name")
      .orderBy("total_sold", "desc")
      .first();

    // 🧠 Insight generation
    let message = "No top-selling data available.";

    if (todayTop && !yesterdayTop) {
      message = `🥇 ${todayTop.name} is leading today with ${todayTop.total_sold} sold.`;
    } else if (!todayTop && yesterdayTop) {
      message = `📊 Yesterday's top product was ${yesterdayTop.name} with ${yesterdayTop.total_sold} sold.`;
    } else if (todayTop && yesterdayTop) {
      const diff = todayTop.total_sold - yesterdayTop.total_sold;

      if (todayTop.name === yesterdayTop.name) {
        message = `📈 ${todayTop.name} is holding strong with ${todayTop.total_sold} sold again today!`;
      } else if (diff > 0) {
        message = `🔥 ${todayTop.name} just beat ${yesterdayTop.name} from yesterday with ${todayTop.total_sold} sold today! (+${diff})`;
      } else {
        message = `📉 ${todayTop.name} is leading today with ${
          todayTop.total_sold
        } sold, but that's ${Math.abs(diff)} less than ${
          yesterdayTop.name
        } yesterday.`;
      }
    }

    res.json({ message });
  } catch (err) {
    console.error("❌ Error generating best-product insight:", err);
    res.status(500).json({ error: "Failed to fetch best product insight" });
  }
});

export default router;
