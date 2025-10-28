import { Router } from "express";
import userRoutes from "./users.js";
import authRoutes from "./authRoutes.js";
import streamRoutes from "./streamRoutes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/stream", streamRoutes);

export default router;
