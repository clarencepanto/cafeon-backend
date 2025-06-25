// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import createProductsRouter from "./routes/products-router.js";
import getSalesRouter from "./routes/sales-router.js";
import customerRouter from "./routes/customer-router.js";
import dashboardRouter from "./routes/dashboard-routes.js";
import insightsRouter from "./routes/insights-router.js";

// Setup
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// Attach routers
app.use("/products", createProductsRouter(io)); // << pass io directly
app.use("/sales", getSalesRouter(io));
app.use("/customers", customerRouter);
app.use("/dashboard", dashboardRouter);
app.use("/insights", insightsRouter);

// Start
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server running with sockets at http://localhost:${PORT}`);
});
