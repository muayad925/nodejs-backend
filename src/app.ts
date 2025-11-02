import express from "express";
import type { Application, Request, Response, NextFunction } from "express";
import { requestLogger } from "./middlewares/requestLogger.js";
import { logger } from "./utils/logger.js";
import cors from "cors";
import routes from "./routes/index.js";
import streamRoutes from "./routes/streamRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import stripeWebhook from "./routes/stripeWebhook.js";
import syncWebhook from "./routes/authWebhook.js";

const app: Application = express();
app.use("/auth/sync", syncWebhook);
app.use("/webhook", stripeWebhook);

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/api", routes);
app.use("/api/stream", streamRoutes);
app.use("/api/events", eventRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).send({ message: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ message: "Internal Server Error" });
});

export default app;
