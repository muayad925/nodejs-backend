import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { randomUUID } from "crypto";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = randomUUID();
  const start = Date.now();

  // Attach request ID for correlation
  (req as any).id = requestId;

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info({
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      userAgent: req.get("user-agent"),
    });
  });

  next();
};
