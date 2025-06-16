import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productsRouter from "./routes/products-router.js";

// load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// for parsing json payloads
app.use(express.json());

app.use("/products", productsRouter); // /api/products

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
