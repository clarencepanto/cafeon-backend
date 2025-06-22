import { Router } from "express";
import db from "../db.js";

const router = Router();

// 📥 GET /api/customers - list all customers
router.get("/", async (req, res) => {
  try {
    const customers = await db("customers").select("*");
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Error fetching customers" });
  }
});

// ➕ POST /api/customers - add a customer
router.post("/", async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const [id] = await db("customers").insert({ name, email, phone });
    const newCustomer = await db("customers").where({ id }).first();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: "Error creating customer" });
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
  const today = new Date().toISOString().split("T")[0];

  try {
    const [{ count }] = await db("sales")
      .whereRaw("DATE(CONVERT_TZ(created_at, '+00:00', '-07:00')) = ?", [today])
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

// ✏️ PUT /api/customers/:id - update customer
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    await db("customers").where({ id }).update({ name, email, phone });
    const updated = await db("customers").where({ id }).first();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating customer" });
  }
});

// ❌ DELETE /api/customers/:id - remove customer
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db("customers").where({ id }).del();
    res.json({ message: `Customer ${id} deleted.` });
  } catch (err) {
    res.status(500).json({ error: "Error deleting customer" });
  }
});

export default router;
