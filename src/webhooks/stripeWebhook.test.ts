import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// ✅ mock modules BEFORE importing them
const stripeMock = {
  webhooks: {
    constructEvent: jest.fn(),
  },
};
jest.unstable_mockModule("../config/stripe.js", () => ({
  stripe: stripeMock,
}));

const prismaMock = {
  user: { findFirst: jest.fn() },
  subscription: { upsert: jest.fn() },
};
jest.unstable_mockModule("../config/db.js", () => ({
  __esModule: true,
  default: prismaMock,
}));

// ✅ now dynamically import modules that depend on those mocks
const { default: router } = await import("./stripeWebhook.js");
const app = express();
app.use("/api/stripe/webhook", router);

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should upsert a subscription when a customer.subscription.created event is received", async () => {
    stripeMock.webhooks.constructEvent.mockReturnValue({
      type: "customer.subscription.created",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          cancel_at_period_end: false,
          current_period_end: 1730000000,
          items: { data: [{ price: { id: "price_123" } }] },
        },
      },
    });

    prismaMock.user.findFirst.mockResolvedValue({ id: "user_1" });
    prismaMock.subscription.upsert.mockResolvedValue({});

    const payload = Buffer.from(JSON.stringify({}));
    const res = await request(app)
      .post("/api/stripe/webhook")
      .set("stripe-signature", "fake_sig")
      .set("Content-Type", "application/json")
      .send(payload);

    expect(res.status).toBe(200);
    expect(prismaMock.subscription.upsert).toHaveBeenCalled();
  });

  it("should return 400 for invalid signature", async () => {
    stripeMock.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const payload = Buffer.from("{}");
    const res = await request(app)
      .post("/api/stripe/webhook")
      .set("stripe-signature", "bad_sig")
      .set("Content-Type", "application/json")
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.text).toContain("Webhook Error: Invalid signature");
  });
});
