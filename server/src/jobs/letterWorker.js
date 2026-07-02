import { Letter } from "../models/Letter.js";
import { sendLetterEmail } from "../services/emailService.js";

let letterWorker = null;
if (process.env.REDIS_HOST) {
  try {
    const { Worker } = await import("bullmq");
    const { redisConnection } = await import("../config/redis.js");
    letterWorker = new Worker(
      "letter-delivery",
      async (job) => {
        const { letterId } = job.data;
        const letter = await Letter.findById(letterId).populate("sender attachments");

        if (!letter || letter.status === "delivered") return;

        await sendLetterEmail(letter);

        letter.status = "delivered";
        letter.deliveredAt = new Date();
        await letter.save();
      },
      { connection: redisConnection }
    );
  } catch (err) {
    console.warn("Failed to start letter worker:", err.message || err);
    letterWorker = null;
  }
} else {
  console.warn("REDIS_HOST not set — letter worker disabled");
}

export { letterWorker };
