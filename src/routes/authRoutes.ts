import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);

export default router;
