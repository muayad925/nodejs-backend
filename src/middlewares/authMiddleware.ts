import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Missing or invalid Authorization header" });
    }

    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    if (typeof decoded !== "object" || !decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { userId, role } = decoded as { userId: number; role: string };
    req.user = { id: userId, role };
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(401).json({ message: "Invalid or missing token" });
  }
};
