import express from "express";
import type { Express } from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import createCors from "./middleware/cors.js";
import { createPublicRateLimit } from "./middleware/rateLimit.js";
import logger from "./utils/logger.js";

const app: Express = express();

app.use(helmet());
app.use(createCors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(createPublicRateLimit());

app.get("/", (_req, res) => {
  res.json({ name: "quiz-cms-backend", status: "ok" });
});

// Health endpoint is added in server after DB wiring
app.get("/health", (_req, res) => {
  const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const status = state === 1 ? "up" : "degraded";
  res.status(200).json({ status, db: state });
});

// Routes will be mounted in server.ts after mongo connection

export default app;
