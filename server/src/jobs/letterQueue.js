import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

let letterQueue = null;
let redisAvailable = !!process.env.REDIS_HOST;

try {
  if (redisAvailable) {
    letterQueue = new Queue("letter-delivery", {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 60000 },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 * 7 }
      }
    });
  }
} catch (err) {
  // If Redis isn't reachable, fall back to no-op queue to allow server startup
  console.warn("Redis unavailable, letter queue disabled:", err.message || err);
  letterQueue = null;
  redisAvailable = false;
}

export async function scheduleDelivery(letter) {
  const delay = new Date(letter.deliveryDate) - Date.now();
  if (delay <= 0) throw new Error("Delivery date must be in the future");

  if (!redisAvailable || !letterQueue) {
    console.warn("scheduleDelivery: Redis not configured — skipping job scheduling for letter", letter._id);
    return null;
  }

  const job = await letterQueue.add(
    "deliver",
    { letterId: letter._id.toString() },
    { delay, jobId: `letter-${letter._id}` }
  );
  return job.id;
}

export { letterQueue };
