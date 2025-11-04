import express from "express";
import type Stripe from "stripe";
import { stripe } from "../config/stripe.js";
import prisma from "../config/db.js";

const router = express.Router();

// mount with express.raw() in server/app (see next section)
router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"]!;
      const event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      if (event.type.startsWith("customer.subscription.")) {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        });

        if (user) {
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: sub.id },
            create: {
              stripeSubscriptionId: sub.id,
              userId: user.id,
              status: sub.status,
              priceId: sub.items.data[0]?.price.id ?? "unknown",
              // @ts-ignore
              currentPeriodEnd: new Date((sub.current_period_end ?? 0) * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
            },
            update: {
              status: sub.status,
              priceId: sub.items.data[0]?.price.id ?? "unknown",
              // @ts-ignore
              currentPeriodEnd: new Date((sub.current_period_end ?? 0) * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
            },
          });
        }
      }

      return res.json({ received: true });
    } catch (err: any) {
      // Signature errors end up here
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

export default router;
