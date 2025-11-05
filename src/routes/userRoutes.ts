import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

// GET /api/users
router.get("/", requireAuth, UserController.getAllUsers);
router.get("/profile", requireAuth, UserController.getProfile);
router.put("/profile", requireAuth, UserController.updateProfile);

export default router;
