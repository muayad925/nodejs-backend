import type { Response, NextFunction } from "express";
import { ensureStripeCustomer } from "../services/billingService.js";
import { stripe } from "../config/stripe.js";
import type { AuthenticatedRequest } from "../middlewares/authMiddleware.js";

export class BillingController {
  static async createCheckoutSession(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { priceId } = req.body; // your Stripe Price ID
      if (!priceId)
        return res.status(400).json({ message: "priceId is required" });
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const customerId = await ensureStripeCustomer(req.user.id);

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.PUBLIC_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.PUBLIC_URL}/billing/cancel`,
        metadata: { userId: String(req.user.id) },
      });

      return res.json({ url: session.url });
    } catch (err) {
      next(err);
    }
  }
}
