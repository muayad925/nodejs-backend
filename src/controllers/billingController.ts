import type { Response, NextFunction } from "express";
import { ensureStripeCustomer } from "../services/billingService.js";
import { stripe } from "../config/stripe.js";
import prisma from "../config/db.js";

export class BillingController {
  static async createCheckoutSession(
    req: any,
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
        success_url: `${process.env.PUBLIC_URL}/home`,
        cancel_url: `${process.env.PUBLIC_URL}/subscribe`,
        metadata: { userId: String(req.user.id) },
      });

      return res.json({ url: session.url });
    } catch (err) {
      next(err);
    }
  }

  static async getMembershipSubscription(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const supabaseUserId = req.user.id;
      const user = await prisma.user.findUnique({
        where: { supabaseAuthId: supabaseUserId },
        select: { id: true },
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const sub = await prisma.subscription.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      return res.json(sub);
    } catch (err) {
      next(err);
    }
  }
}
