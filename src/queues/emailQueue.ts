// ESM + TS (NodeNext)
import { Queue } from "bullmq";

const connection = { connection: { url: process.env.REDIS_URL! } };

export type WelcomeJob = { userId: number; email: string; name: string };

export const emailQueue = new Queue<WelcomeJob>("email", connection);
