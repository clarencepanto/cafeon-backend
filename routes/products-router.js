import { Router } from "express";
import db from "../db.js";

const router = Router();

// GET /api/products

router.get("/", async (req, res) => {
  const { category } = req.query;

  let query = db("products");

  if (category) {
    query = query.where({ category });
  }

  const products = await query.select(
    "id",
    "name",
    "price",
    "quantity",
    "image_url",
    "ingredients"
  );

  res.json(products);
});

// POST /api/products
router.post("/", async (req, res) => {
  const { name, price, quantity } = req.body;
  try {
    const [id] = await db("products").insert({ name, price, quantity });
    const newProduct = await db("products").where({ id }).first();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT update a product
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;

  try {
    await db("products").where({ id }).update({ name, price, quantity });
    const updated = await db("products").where({ id }).first();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating product" });
  }
});

// Delete a product
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db("products").where({ id }).del();
    res.json({ message: `Product ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: "Error deleting product" });
  }
});

export default router;
