import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products-router.js";
import salesRouter from "./routes/sales-router.js";
import customerRouter from "./routes/customer-router.js";
import insightsRouter from "./routes/insights-router.js";

// load env variables
dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;

// for parsing json payloads
app.use(express.json());

app.use("/products", productsRouter); // /api/products
app.use("/sales", salesRouter); // /api/sales
app.use("/customers", customerRouter); // /api/customers
app.use("/insights", insightsRouter); // /api/insight (python)

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
