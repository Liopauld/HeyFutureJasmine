import { runSweepOnce } from "../jobs/deliverySweep.js";

/**
 * Turns every incoming request into a delivery tick.
 *
 * The cron sweep only runs while the process is alive, and on a free hosting tier
 * the API sleeps after ~15 minutes idle — so a chest whose day arrives at 3am can
 * sit undelivered until someone happens to wake the service. This middleware makes
 * the first request after any gap catch up immediately, including the health check.
 *
 * Throttled and fire-and-forget: it never delays a response, and never stacks.
 * `deliverLetter` claims atomically, so racing the cron or the BullMQ worker is safe.
 */
const MIN_INTERVAL_MS = Number(process.env.SWEEP_MIN_INTERVAL_MS || 5 * 60 * 1000);

let lastSweepAt = 0;
let inFlight = false;

export function sweepOnRequest(req, res, next) {
  const now = Date.now();
  if (!inFlight && now - lastSweepAt >= MIN_INTERVAL_MS) {
    lastSweepAt = now;
    inFlight = true;
    runSweepOnce()
      .catch((err) => console.warn("[sweep] request-triggered error:", err.message || err))
      .finally(() => {
        inFlight = false;
      });
  }
  next();
}

/** Test hook: forget the throttle so the next request sweeps again. */
export function resetSweepThrottle() {
  lastSweepAt = 0;
}
