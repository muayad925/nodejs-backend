import { Router } from "express";
import userRoutes from "./users.js";
import authRoutes from "./authRoutes.js";
import streamRoutes from "./streamRoutes.js";
import billingRouter from "./billingRoutes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/stream", streamRoutes);
router.use("/billing", billingRouter);

export default router;
