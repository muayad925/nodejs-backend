import { Router } from "express";
import prisma from "../config/db.js";
import { Webhook } from "standardwebhooks";
import express from "express";
import { stripe } from "../config/stripe.js";

const router = Router();

router.post(
  "/",
  express.text({ type: "application/json" }),
  async (req, res) => {
    try {
      const secret = process.env.SUPABASE_WEBHOOK_SECRET!.replace(
        "v1,whsec_",
        ""
      );
      const wh = new Webhook(secret);
      // @ts-ignore
      const { user } = wh.verify(req.body, req.headers);

      const localUser = await prisma.user.upsert({
        where: { supabaseAuthId: user.id },
        create: {
          supabaseAuthId: user.id,
          email: user.email,
          firstName: user.user_metadata?.firstName ?? null,
          lastName: user.user_metadata?.lastName ?? null,
        },
        update: {
          email: user.email,
          firstName: user.user_metadata?.firstName ?? null,
          lastName: user.user_metadata?.lastName ?? null,
        },
      });

      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: user.id },
      });

      await prisma.user.update({
        where: { id: localUser.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });

      return res.status(200).json({ status: "ok" });
    } catch (err) {
      console.error("❌ Webhook verification failed:", err);
      res.status(400).json({ error: "Invalid webhook signature" });
    }
  }
);

export default router;
