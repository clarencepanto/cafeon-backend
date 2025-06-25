import { Router } from "express";
import db from "../db.js";

export default function (io) {
  const router = Router();

  // POST /sales
  router.post("/", async (req, res) => {
    const { customer_id, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required." });
    }

    const trx = await db.transaction();

    try {
      const total = items.reduce((sum, item) => {
        const price = Number(item.price);
        return sum + price * item.quantity;
      }, 0);

      const [sale_id] = await trx("sales").insert({
        customer_id: customer_id || null,
        total,
      });

      const saleItems = items.map((item) => ({
        sale_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: Number(item.price),
      }));

      await trx("sale_items").insert(saleItems);

      for (const item of items) {
        await trx("products")
          .where({ id: item.product_id })
          .decrement("quantity", item.quantity);

        const updatedProduct = await trx("products")
          .where({ id: item.product_id })
          .select(
            "id",
            "name",
            "price",
            "quantity",
            "category",
            "image_url",
            "ingredients"
          )
          .first();

        // ✅ Send update to all clients
        console.log("🔄 Emitting updated product:", updatedProduct);
        io.emit("productUpdated", updatedProduct);
      }

      await trx.commit();
      res.status(201).json({ message: "Sale completed", sale_id });
    } catch (err) {
      await trx.rollback();
      res.status(500).json({ error: "Failed to process sale" });
    }
  });

  // GET /sales
  router.get("/", async (req, res) => {
    try {
      const sales = await db("sales").select("id", "total", "created_at");
      res.json(sales);
    } catch (err) {
      res.status(500).json({ error: "Error fetching sales" });
    }
  });

  // GET /sales/latest
  router.get("/latest", async (req, res) => {
    try {
      const latest = await db("sales").orderBy("id", "desc").first();
      res.json({ sale_id: latest?.id || 0 });
    } catch (err) {
      console.error("❌ Error fetching latest receipt:", err);
      res.status(500).json({ error: "Failed to fetch latest receipt" });
    }
  });

  // GET /sales/:id
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const sale = await db("sales").where({ id }).first();
    if (!sale) return res.status(404).json({ error: "Sale not found" });

    const items = await db("sale_items")
      .join("products", "sale_items.product_id", "products.id")
      .where("sale_items.sale_id", id)
      .select("products.name", "sale_items.quantity", "sale_items.price");

    res.json({ ...sale, items });
  });

  return router;
}
