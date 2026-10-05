import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import auth from "./routes/auth.js";
import products from "./routes/products.js";
import plants from "./routes/plants.js";
import mix from "./routes/mix.js";
import orders from "./routes/orders.js";
import admin from "./routes/admin.js";
import profile from "./routes/profile.js";
import { notFound, errorHandler } from "./middleware/error.js";
const app = express();
app.use(helmet());
app.use(cors({ origin: config.client }));
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "CocoGrow API" }),
);
app.use("/api/auth", auth);
app.use("/api/users", profile);
app.use("/api/products", products);
app.use("/api/plants", plants);
app.use("/api/mix", mix);
app.use("/api/orders", orders);
app.use("/api/admin", admin);
app.use(notFound);
app.use(errorHandler);
mongoose
  .connect(config.mongo)
  .then(() =>
    app.listen(config.port, () =>
      console.log(`CocoGrow API running on ${config.port}`),
    ),
  )
  .catch((e) => {
    console.error("MongoDB connection failed:", e);
    process.exit(1);
  });
