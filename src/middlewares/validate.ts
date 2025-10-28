import Zod from "zod";
import type { Request, Response, NextFunction } from "express";
import type { ZodObject, ZodError } from "zod";

export const validate =
  (schema: {
    body?: ZodObject<any>;
    query?: ZodObject<any>;
    params?: ZodObject<any>;
  }) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      // @ts-ignore
      if (schema.query) req.query = schema.query.parse(req.query);
      // @ts-ignore
      if (schema.params) req.params = schema.params.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof Zod.ZodError) {
        const errors = (err as ZodError).issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        }));
        return res.status(400).json({ message: "Validation error", errors });
      }
      next(err);
    }
  };
