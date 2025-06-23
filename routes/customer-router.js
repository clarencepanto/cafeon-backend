import { Router } from "express";
import db from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await db("customers")
      .leftJoin("sales", "customers.id", "sales.customer_id")
      .select(
        "customers.id",
        "customers.name",
        "customers.phone",
        "customers.frequent_order",
        db.raw(
          "COUNT(DISTINCT DATE(CONVERT_TZ(sales.created_at, '+00:00', '-07:00'))) as visits"
        )
      )
      .groupBy("customers.id");

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching loyal customer table:", err);
    res.status(500).json({ error: "Failed to load customer table" });
  }
});

router.post("/", async (req, res) => {
  const { name, phone, frequent_order, visits } = req.body;

  try {
    const [id] = await db("customers").insert({
      name,
      phone,
      frequent_order,
      visits,
    });

    res.status(201).json({ message: "Customer created", id });
  } catch (err) {
    console.error("❌ Error adding customer:", err);
    res.status(500).json({ error: "Failed to add customer" });
  }
});

// customer count
router.get("/loyal-customers-count", async (req, res) => {
  try {
    const [{ count }] = await db("customers").count("id as count");
    res.json({ count });
  } catch (err) {
    console.error("❌ Error fetching loyal customer count:", err);
    res.status(500).json({ error: "Failed to count loyal customers" });
  }
});

// loyal customer-insights
router.get("/loyal-customers-insight", async (req, res) => {
  const today = new Date();
  const yesterday = new Date();
  today.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);

  try {
    const [{ count: todayCount }] = await db("customers")
      .where("created_at", ">=", today)
      .count("id as count");

    const [{ count: yesterdayCount }] = await db("customers")
      .where("created_at", ">=", yesterday)
      .andWhere("created_at", "<", today)
      .count("id as count");

    const current = Number(todayCount);
    const previous = Number(yesterdayCount);

    let insight = "Not enough data to compare yet.";

    if (previous > 0) {
      const diff = current - previous;
      insight =
        diff > 0
          ? `🔥 ${current} new members today! Up from ${previous} yesterday. Keep it up!`
          : diff < 0
          ? `📉 Only ${current} new members today. You had ${previous} yesterday — let’s push harder!`
          : `📊 Same number of new members today and yesterday — ${current} each. Let’s aim higher!`;
    } else if (current > 0) {
      insight = `🚀 ${current} new member${
        current > 1 ? "s" : ""
      } today! First signs of growth!`;
    }

    res.json({ current, previous, insight });
  } catch (err) {
    console.error("❌ Error generating loyal customer insight:", err);
    res
      .status(500)
      .json({ error: "Failed to generate loyal customer insight" });
  }
});

// get top customer
router.get("/top-customer", async (req, res) => {
  try {
    const top = await db("sales")
      .join("customers", "customers.id", "sales.customer_id")
      .groupBy("customers.id", "customers.name")
      .select("customers.name")
      .sum("sales.total as total_spent")
      .orderBy("total_spent", "desc")
      .first();

    res.json(top || { name: "No customer data", total_spent: 0 });
  } catch (err) {
    console.error("❌ Error fetching top customer:", err);
    res.status(500).json({ error: "Failed to fetch top customer" });
  }
});

// customer served today

router.get("/customers-served-today", async (req, res) => {
  // Set start of today in local timezone (e.g., -07:00)
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  try {
    const [{ count }] = await db("sales")
      .where("created_at", ">=", start)
      .andWhere("created_at", "<", end)
      .count("id as count");

    res.json({ servedToday: parseInt(count) });
  } catch (err) {
    console.error("❌ Error counting served customers:", err);
    res.status(500).json({ error: "Failed to count served customers" });
  }
});

// customer insights
router.get("/customer-insight", async (req, res) => {
  const { range = "day" } = req.query;
  const now = new Date();
  let startCurrent, startPrevious;

  switch (range) {
    case "week":
      startCurrent = new Date(now);
      startCurrent.setDate(now.getDate() - 6);
      startPrevious = new Date(now);
      startPrevious.setDate(now.getDate() - 13);
      break;
    case "month":
      startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
      startPrevious = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case "year":
      startCurrent = new Date(now.getFullYear(), 0, 1);
      startPrevious = new Date(now.getFullYear() - 1, 0, 1);
      break;
    default: // "day"
      startCurrent = new Date(now);
      startCurrent.setHours(0, 0, 0, 0);
      startPrevious = new Date(now);
      startPrevious.setDate(now.getDate() - 1);
      startPrevious.setHours(0, 0, 0, 0);
      break;
  }

  try {
    const current = await db("sales")
      .where("created_at", ">=", startCurrent)
      .count("id as count");
    const previous = await db("sales")
      .where("created_at", ">=", startPrevious)
      .andWhere("created_at", "<", startCurrent)
      .count("id as count");

    const curr = Number(current[0].count);
    const prev = Number(previous[0].count);

    let message = "Not enough data to compare.";
    if (prev > 0) {
      const change = ((curr - prev) / prev) * 100;
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
          ? `🚀 ${label}'s customer visits (${curr}) are up ${change.toFixed(
              1
            )}% vs last ${range}.`
          : `📉 ${label}'s customer visits (${curr}) are down ${Math.abs(
              change
            ).toFixed(1)}% vs last ${range}.`;
    }

    res.json({ current: curr, previous: prev, insight: message });
  } catch (err) {
    console.error("❌ Error generating customer insight:", err);
    res.status(500).json({ error: "Failed to generate customer insight" });
  }
});

// update
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, phone, frequent_order, visits } = req.body;

  try {
    await db("customers")
      .where({ id })
      .update({ name, phone, frequent_order, visits });

    res.json({ message: "Customer updated" });
  } catch (err) {
    console.error("❌ Error updating customer:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// delete customer
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db("customers").where({ id }).del();
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error("❌ Error deleting customer:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

export default router;
