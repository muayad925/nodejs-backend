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
      const supabaseUserId = req.user.id;

      if (!priceId)
        return res.status(400).json({ message: "priceId is required" });
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const customerId = await ensureStripeCustomer(supabaseUserId);

      const user = await prisma.user.findUnique({
        where: { supabaseAuthId: supabaseUserId },
        select: { id: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const existing = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: { in: ["active", "trialing", "past_due", "unpaid"] },
        },
      });

      if (existing) {
        return res
          .status(400)
          .json({ error: "User already has an active subscription" });
      }

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

  static async createPortalSession(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const supabaseUserId = req.user.id;
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const customerId = await ensureStripeCustomer(supabaseUserId);

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.PUBLIC_URL}/account`,
      });

      return res.json({ url: session.url });
    } catch (err) {
      next(err);
    }
  }
}
