import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

// GET /api/insights/top-products
router.get("/top-products", (req, res) => {
  //  process.cwd() means : this project folder , then we navigate to /ai-engine/top_products.json
  const filePath = path.join(process.cwd(), "ai-engine", "top_products.json");

  //   reads the filepath declared upstairs
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Failed to read insights file:", err);
      return res.status(500).json({ error: "Could not load insights" });
    }

    try {
      // converts raw file into real json object
      const insights = JSON.parse(data);
      res.json(insights);
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      res.status(500).json({ error: "Invalid insights format" });
    }
  });
});

// 🔹 GET /api/insights/weekly-revenue
router.get("/weekly-revenue", (req, res) => {
  const filePath = path.join(process.cwd(), "ai-engine", "weekly_revenue.json");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Failed to read revenue file:", err);
      return res.status(500).json({ error: "Could not load revenue insight" });
    }

    try {
      const revenue = JSON.parse(data);
      res.json(revenue);
    } catch (parseError) {
      console.error("Invalid revenue JSON:", parseError);
      res.status(500).json({ error: "Invalid revenue data format" });
    }
  });
});

export default router;

// 🎯 Goal: Build /api/insights/top-products
// This route will:

// Read your top_products.json (from Python)

// Send it as an API response

// So your frontend (or Postman) can fetch and display it
