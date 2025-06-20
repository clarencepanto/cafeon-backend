import { Router } from "express";
import db from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const { customer_id, items } = req.body;

  //   check if items are in a proper list format or exist
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Items are required." });
  }

  //    start transactions, groups db operations so they all succeed or all fail, no half complete sales
  const trx = await db.transaction();

  try {
    // add total price, multiply by quantity and sum it up
    const total = items.reduce((sum, item) => {
      // tells js to not round up
      const price = Number(item.price);
      return sum + price * item.quantity;
    }, 0);

    // add new row in sales table, and save id for that sale
    const [sale_id] = await trx("sales").insert({
      customer_id: customer_id || null,
      total,
    });

    // formats items so that its ready to go into sale_items
    const saleItems = items.map((item) => ({
      sale_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: Number(item.price),
    }));

    // save items in sale_items table
    await trx("sale_items").insert(saleItems);

    // for each product sold, reduce the stock in products table
    for (const item of items) {
      await trx("products")
        .where({ id: item.product_id })
        .decrement("quantity", item.quantity);
    }

    // if all succeeded, save them to database permanently
    await trx.commit();
    res.status(201).json({ message: "Sale completed", sale_id });
  } catch (err) {
    // if something fails , undo all DB changes
    await trx.rollback();
    res.status(500).json({ error: "Failed to process sale" });
  }
});

// Get all sales
router.get("/", async (req, res) => {
  try {
    const sales = await db("sales").select("id", "total", "created_at");
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: "Error fetching sales" });
  }
});

// GET latest receipt
router.get("/latest", async (req, res) => {
  try {
    const latest = await db("sales").orderBy("id", "desc").first();
    res.json({ sale_id: latest?.id || 0 });
  } catch (err) {
    console.error("❌ Error fetching latest receipt:", err);
    res.status(500).json({ error: "Failed to fetch latest receipt" });
  }
});

// Get Sale Details
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  //   look up sale in sales table, if not found , return error
  const sale = await db("sales").where({ id }).first();
  if (!sale) return res.status(404).json({ error: "Sale not found" });

  //   join with product table so that we can show product names
  const items = await db("sale_items")
    .join("products", "sale_items.product_id", "products.id")
    .where("sale_items.sale_id", id)
    .select("products.name", "sale_items.quantity", "sale_items.price");

  res.json({ ...sale, items });
});

export default router;
