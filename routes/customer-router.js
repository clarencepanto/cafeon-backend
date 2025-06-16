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
