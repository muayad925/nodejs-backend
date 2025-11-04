import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// 🧰 Mock modules before import
const prismaMock = {
  user: {
    upsert: jest.fn(),
    update: jest.fn(),
  },
};
jest.unstable_mockModule("../config/db.js", () => ({
  __esModule: true,
  default: prismaMock,
}));

const stripeMock = {
  customers: {
    create: jest.fn(),
  },
};
jest.unstable_mockModule("../config/stripe.js", () => ({
  stripe: stripeMock,
}));

// Mock the standardwebhooks library
const verifyMock = jest.fn();
const WebhookMock = jest.fn().mockImplementation(() => ({
  verify: verifyMock,
}));
jest.unstable_mockModule("standardwebhooks", () => ({
  Webhook: WebhookMock,
}));

// ✅ Import after mocks
const { default: router } = await import("./authWebhook.js");

const app = express();
app.use("/sync", router);

// Helpers
const fakeUserPayload = {
  id: "user_123",
  email: "test@example.com",
  user_metadata: { firstName: "Jane", lastName: "Doe" },
};

// --- TESTS ---
describe("POST /sync (Supabase Webhook)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_WEBHOOK_SECRET = "v1,whsec_testsecret";
  });

  it("✅ creates or updates user and Stripe customer", async () => {
    // Mock Webhook verification success
    verifyMock.mockReturnValue({ user: fakeUserPayload });

    // Mock Prisma
    prismaMock.user.upsert.mockResolvedValue({ id: 1 });
    prismaMock.user.update.mockResolvedValue({});

    // Mock Stripe
    stripeMock.customers.create.mockResolvedValue({
      id: "cus_123",
      email: "test@example.com",
    });

    const res = await request(app)
      .post("/sync")
      .set("Content-Type", "application/json")
      .send(JSON.stringify({}));

    expect(res.status).toBe(200);
    expect(WebhookMock).toHaveBeenCalledWith("testsecret");
    expect(prismaMock.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { supabaseAuthId: "user_123" },
      })
    );
    expect(stripeMock.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        name: "Jane Doe",
        metadata: { userId: 1 },
      })
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { stripeCustomerId: "cus_123" },
    });
  });

  it("❌ returns 400 if verification fails", async () => {
    verifyMock.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const res = await request(app)
      .post("/sync")
      .set("Content-Type", "application/json")
      .send("{}");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid webhook signature");
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });
});
