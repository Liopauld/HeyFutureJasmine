import { deliverLetter } from "../services/letterService.js";

// Precise, to-the-second delivery via BullMQ. Only runs when Redis is present;
// the cron sweep (deliverySweep.js) is the durable fallback.
let letterWorker = null;

if (process.env.REDIS_HOST) {
  try {
    const { Worker } = await import("bullmq");
    const { redisConnection } = await import("../config/redis.js");
    letterWorker = new Worker(
      "letter-delivery",
      async (job) => {
        await deliverLetter(job.data.letterId);
      },
      { connection: redisConnection }
    );
    letterWorker.on("failed", (job, err) =>
      console.warn(`Delivery job ${job?.id} failed:`, err?.message || err)
    );
    console.log("Letter delivery worker started");
  } catch (err) {
    console.warn("Failed to start letter worker:", err.message || err);
    letterWorker = null;
  }
} else {
  console.log("REDIS_HOST not set — letter worker disabled (sweep will deliver)");
}

export { letterWorker };
