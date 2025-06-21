import { Router } from "express";
import db from "../db.js";

const router = Router();

// average transaction value
router.get("/average", async (req, res) => {
  try {
    const [{ avg }] = await db("sales")
      .whereRaw("DATE(created_at) = CURDATE()")
      .avg("total as avg");

    res.json({ average_transaction: parseFloat(avg).toFixed(2) || "0.00" });
  } catch (err) {
    console.error("❌ Error fetching average transaction:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch average transaction value" });
  }
});

// best product today
router.get("/best-product", async (req, res) => {
  try {
    const bestProduct = await db("sale_items")
      .join("sales", "sale_items.sale_id", "sales.id")
      .join("products", "sale_items.product_id", "products.id")
      .whereRaw("DATE(sales.created_at) = CURDATE()")
      .select("products.name")
      .sum("sale_items.quantity as total_sold")
      .groupBy("products.name")
      .orderBy("total_sold", "desc")
      .first();

    if (!bestProduct) {
      return res.json({ name: "N/A", total_sold: 0 });
    }

    res.json(bestProduct);
  } catch (err) {
    console.error("❌ Error fetching best product:", err);
    res.status(500).json({ error: "Failed to fetch best product" });
  }
});

// revenue
// endpoints
// http://localhost:4000/dashboard/revenue?range=day
// http://localhost:4000/dashboard/revenue?range=week
// http://localhost:4000/dashboard/revenue?range=month
// http://localhost:4000/dashboard/revenue?range=year
router.get("/revenue", async (req, res) => {
  const { range = "day" } = req.query;

  let startDate;
  const today = new Date();

  switch (range) {
    case "week":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    case "month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case "year":
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    default: // "day"
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  try {
    const result = await db("sales")
      .where("created_at", ">=", startDate)
      .sum("total as total_revenue")
      .first();

    res.json({
      range,
      total_revenue: result?.total_revenue || 0,
    });
  } catch (err) {
    console.error("❌ Revenue fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch revenue" });
  }
});

// top products
router.get("/top-products", async (req, res) => {
  const { range = "day" } = req.query;

  let startDate;
  const today = new Date();

  switch (range) {
    case "week":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    case "month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    default: // "day"
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  try {
    const topProducts = await db("sale_items")
      .join("sales", "sale_items.sale_id", "sales.id")
      .join("products", "sale_items.product_id", "products.id")
      .where("sales.created_at", ">=", startDate)
      .select("products.name")
      .sum("sale_items.quantity as total_sold")
      .groupBy("products.name")
      .orderBy("total_sold", "desc")
      .limit(5);

    res.json(topProducts);
  } catch (err) {
    console.error("❌ Top products fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch top-selling products" });
  }
});

// sales bar chart
router.get("/sales-per-hour", async (req, res) => {
  try {
    const results = await db("sales")
      .select(
        db.raw("HOUR(created_at) as hour"),
        db.raw("COUNT(*) as total_sales"),
        db.raw("SUM(total) as revenue")
      )
      .whereRaw("DATE(created_at) = CURDATE()") // only today
      .groupByRaw("HOUR(created_at)")
      .orderBy("hour");

    // format hours so they’re always present (0 to 23), even if 0 sales
    const fullDay = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      total_sales: 0,
      revenue: 0,
    }));

    for (const row of results) {
      fullDay[row.hour] = {
        hour: row.hour,
        total_sales: row.total_sales,
        revenue: parseFloat(row.revenue),
      };
    }

    res.json(fullDay);
  } catch (err) {
    console.error("❌ Error getting sales per hour:", err);
    res.status(500).json({ error: "Failed to get sales per hour" });
  }
});

export default router;
