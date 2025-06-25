// products-router.js
import { Router } from "express";
import db from "../db.js";

function createProductsRouter(io) {
  const router = Router();

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
      "ingredients",
      "category"
    );

    res.json(products);
  });

  router.post("/", async (req, res) => {
    const { name, price, quantity, category } = req.body;
    try {
      const [id] = await db("products").insert({
        name,
        price,
        quantity,
        category,
      });
      const newProduct = await db("products").where({ id }).first();

      io.emit("productCreated", newProduct);
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, price, quantity } = req.body;

    try {
      await db("products").where({ id }).update({ name, price, quantity });
      const updated = await db("products").where({ id }).first();

      io.emit("productUpdated", updated);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: "Error updating product" });
    }
  });

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
      await db("products").where({ id }).del();
      io.emit("productDeleted", { id });
      res.json({ message: `Product ${id} deleted` });
    } catch (err) {
      res.status(500).json({ error: "Error deleting product" });
    }
  });

  return router;
}

export default createProductsRouter;
