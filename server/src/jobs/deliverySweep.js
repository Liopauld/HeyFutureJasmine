import cron from "node-cron";
import { Letter } from "../models/Letter.js";
import { deliverLetter } from "../services/letterService.js";

/**
 * The reliability net. BullMQ handles precise timing, but a delayed job sitting
 * in Redis for months/years can be lost to an outage or migration. This sweep
 * runs on a schedule, finds every chest whose date has passed but is still
 * undelivered, and delivers it. `deliverLetter` is idempotent, so this can never
 * double-send alongside the worker.
 */
export async function runSweepOnce() {
  const due = await Letter.find({
    deliveryDate: { $lte: new Date() },
    status: { $ne: "delivered" }
  })
    .select("_id")
    .limit(500);

  let delivered = 0;
  for (const { _id } of due) {
    if (await deliverLetter(_id)) delivered += 1;
  }
  if (delivered) console.log(`[sweep] delivered ${delivered} overdue letter(s)`);
  return delivered;
}

let task = null;

export function startDeliverySweep() {
  if (task) return task;
  // Every 5 minutes — responsive enough for a personal app, cheap to run.
  const schedule = process.env.SWEEP_CRON || "*/5 * * * *";
  task = cron.schedule(schedule, () => {
    runSweepOnce().catch((err) => console.warn("[sweep] error:", err.message || err));
  });
  // Catch anything already overdue at boot (e.g. downtime spanned a delivery).
  runSweepOnce().catch((err) => console.warn("[sweep] boot error:", err.message || err));
  console.log(`Delivery sweep scheduled (${schedule})`);
  return task;
}
