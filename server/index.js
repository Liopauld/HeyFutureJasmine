import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./src/app.js");
const { connectDb } = await import("./src/config/db.js");

const port = process.env.PORT || 5000;

await connectDb();

// Delivery machinery:
//  - the BullMQ worker gives precise timing (only if Redis is configured)
//  - the cron sweep is the durable safety net and always runs
await import("./src/jobs/letterWorker.js");
const { startDeliverySweep } = await import("./src/jobs/deliverySweep.js");
startDeliverySweep();

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
