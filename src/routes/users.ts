import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorize.js";

const router = Router();

// GET /api/users
router.get("/", requireAuth, UserController.getAllUsers);

export default router;
