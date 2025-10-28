import { Worker, QueueEvents } from "bullmq";
import { EmailService } from "../services/emailService.js";
import type { WelcomeJob } from "../queues/emailQueue.js";

const connection = { connection: { url: process.env.REDIS_URL! } };
const emailService = new EmailService();

const worker = new Worker<WelcomeJob>(
  "email",
  async (job) => {
    if (job.name === "welcomeEmail") {
      const { userId, email, name } = job.data as {
        userId: number;
        email: string;
        name: string;
      };
      await emailService.sendWelcomeEmail(email, name);
      console.log(
        `[worker] sending welcome to ${name} <${email}> (user ${userId})`
      );
      // simulate work
      await new Promise((r) => setTimeout(r, 250));
    }
  },
  {
    ...connection,
    concurrency: Number(process.env.EMAIL_WORKER_CONCURRENCY || 5),
  }
);

// Basic events (optional)
const events = new QueueEvents("email", connection);
events.on("completed", ({ jobId }) =>
  console.log(`[worker] completed ${jobId}`)
);
events.on("failed", ({ jobId, failedReason }) =>
  console.error(`[worker] failed ${jobId}: ${failedReason}`)
);

const shutdown = async () => {
  await worker.close();
  await events.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
worker.on("ready", () => console.log("[worker] waiting for jobs..."));
worker.on("error", (err) => console.error("[worker] redis error:", err));
