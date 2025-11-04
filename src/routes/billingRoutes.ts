import { Router } from "express";
import { BillingController } from "../controllers/billingController.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/checkout", requireAuth, BillingController.createCheckoutSession);
router.post("/portal", requireAuth, BillingController.createPortalSession);
router.get(
  "/subscription",
  requireAuth,
  BillingController.getMembershipSubscription
);

export default router;
