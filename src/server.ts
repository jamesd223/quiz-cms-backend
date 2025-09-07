import mongoose from "mongoose";
import http from "node:http";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();
import errorHandler, { notFound } from "./middleware/error.js";
import swaggerUi from "swagger-ui-express";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import express from "express";
import { z } from "zod";
import mediaRouter from "./routes/media.js";
import brandsRouter from "./routes/brands.js";
import quizzesRouter from "./routes/quizzes.js";
import versionsRouter from "./routes/versions.js";
import stepsRouter from "./routes/steps.js";
import fieldsRouter from "./routes/fields.js";
import optionsRouter from "./routes/options.js";
import groupedInputsRouter from "./routes/groupedInputs.js";
import submissionsRouter from "./routes/submissions.js";
import authRouter from "./routes/auth.js";
import logger from "./utils/logger.js";

const PORT = Number(process.env.PORT || 3000);
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quizcms";

async function connectWithRetry(): Promise<void> {
  const maxRetries = 10;
  const delayMs = 1_000;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(MONGODB_URI);
      logger.info({ uri: MONGODB_URI }, "mongo_connected");
      return;
    } catch (err) {
      logger.error({ err, attempt }, "mongo_connect_failed");
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * attempt));
    }
  }
}

async function start() {
  await connectWithRetry();

  // Mount routers
  app.use("/v1/media", mediaRouter);
  app.use("/v1/auth", authRouter);
  app.use("/v1/brands", brandsRouter);
  app.use("/v1/quizzes", quizzesRouter);
  app.use("/v1/versions", versionsRouter);
  app.use("/v1/steps", stepsRouter);
  app.use("/v1/fields", fieldsRouter);
  app.use("/v1/options", optionsRouter);
  app.use("/v1/grouped-inputs", groupedInputsRouter);
  app.use("/v1/submissions", submissionsRouter);

  // OpenAPI stub generation; paths would be added progressively
  const { buildOpenAPIDocument } = await import("./openapi.js");
  const openApiDoc = buildOpenAPIDocument(`http://localhost:${PORT}`);
  app.get("/openapi.json", (_req, res) => res.json(openApiDoc));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));

  // 404 and error handlers last
  app.use(notFound);
  app.use(errorHandler);

  const server = http.createServer(app);
  server.listen(PORT, () => {
    logger.info({ port: PORT }, "server_listening");
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "shutdown");
    await mongoose.disconnect();
    server.close(() => process.exit(0));
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  logger.error({ err }, "fatal_startup_error");
  process.exit(1);
});
