import { Router } from "express";
import { BillingController } from "../controllers/billingController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/checkout", requireAuth, BillingController.createCheckoutSession);
// Add portal/session routes later if needed

export default router;
