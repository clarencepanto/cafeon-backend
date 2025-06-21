import { Router } from "express";
import db from "../db.js";
const router = Router();

router.get("/atv-change", async (req, res) => {
  const now = new Date();
  const currentHour = now.getHours();
  const today = now.toISOString().split("T")[0]; // e.g., "2025-06-16"

  try {
    // Current Hour Sales
    const currentHourSales = await db("sales")
      .whereRaw("HOUR(created_at) = ? AND DATE(created_at) = ?", [
        currentHour,
        today,
      ])
      .select("total");

    const prevHourSales = await db("sales")
      .whereRaw("HOUR(created_at) = ? AND DATE(created_at) = ?", [
        currentHour - 1,
        today,
      ])
      .select("total");

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
      const changeText =
        change > 0
          ? `📈 ATV increased by ${change.toFixed(1)}% this hour.`
          : `📉 ATV decreased by ${Math.abs(change).toFixed(1)}% this hour.`;

      message = changeText;
    }

    res.json({
      currentATV: currentATV.toFixed(2),
      prevATV: prevATV.toFixed(2),
      insight: message,
    });
  } catch (err) {
    console.error("Error generating ATV insight:", err);
    res.status(500).json({ error: "Failed to generate ATV insight" });
  }
});

// revenue insight
router.get("/revenue-change", async (req, res) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  try {
    // Today’s revenue
    const todaySales = await db("sales")
      .whereRaw("DATE(created_at) = ?", [today])
      .select("total");

    // Yesterday’s revenue
    const yesterdaySales = await db("sales")
      .whereRaw("DATE(created_at) = ?", [yesterdayStr])
      .select("total");

    const calcTotal = (sales) =>
      sales.reduce((sum, s) => sum + Number(s.total), 0);

    const todayTotal = calcTotal(todaySales);
    const yesterdayTotal = calcTotal(yesterdaySales);

    let message = "Not enough data to compare.";

    if (yesterdayTotal > 0) {
      const change = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
      const changeText =
        change > 0
          ? `🔥 Today’s revenue ($${todayTotal.toFixed(
              2
            )}) is up ${change.toFixed(1)}% vs yesterday.`
          : `📉 Today’s revenue ($${todayTotal.toFixed(2)}) is down ${Math.abs(
              change
            ).toFixed(1)}% vs yesterday.`;

      message = changeText;
    }

    res.json({
      today: todayTotal.toFixed(2),
      yesterday: yesterdayTotal.toFixed(2),
      insight: message,
    });
  } catch (err) {
    console.error("Error generating revenue insight:", err);
    res.status(500).json({ error: "Failed to generate revenue insight" });
  }
});

// 📦 GET the best-selling product insight (today vs yesterday)
router.get("/best-product", async (req, res) => {
  try {
    // 🕒 Get today's and yesterday's dates
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // 🔤 Format to YYYY-MM-DD (MySQL-style date)
    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // 📊 Query: Today's top-selling product
    const todayTop = await db("sale_items")
      .join("sales", "sales.id", "sale_items.sale_id")
      .join("products", "products.id", "sale_items.product_id")
      .whereRaw("DATE(sales.created_at) = ?", [todayStr])
      .select("products.name")
      .sum("sale_items.quantity as total_sold")
      .groupBy("products.name")
      .orderBy("total_sold", "desc")
      .first();

    // 📊 Query: Yesterday's top-selling product
    const yesterdayTop = await db("sale_items")
      .join("sales", "sales.id", "sale_items.sale_id")
      .join("products", "products.id", "sale_items.product_id")
      .whereRaw("DATE(sales.created_at) = ?", [yesterdayStr])
      .select("products.name")
      .sum("sale_items.quantity as total_sold")
      .groupBy("products.name")
      .orderBy("total_sold", "desc")
      .first();

    // 🧠 Generate smart insight message
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

    // ✅ Send the final message
    res.json({ message });
  } catch (err) {
    // ❌ Error handling
    console.error("❌ Error generating best-product insight:", err);
    res.status(500).json({ error: "Failed to fetch best product insight" });
  }
});

export default router;
