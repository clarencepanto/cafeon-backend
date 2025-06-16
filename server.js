import express from "express";
import cors from "cors";
import knex from "knex";
import dotenv from "dotenv";
import knexConfig from "./knexfile.js";

// load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const db = knex(knexConfig.development);

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Cafeon API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
