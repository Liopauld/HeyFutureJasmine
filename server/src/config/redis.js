import IORedis from "ioredis";

// BullMQ requires `maxRetriesPerRequest: null`. We also keep retries bounded
// so a missing/unreachable Redis degrades gracefully instead of spamming logs —
// the daily delivery sweep is the reliable fallback when Redis is down.
let redisConnection = null;

if (process.env.REDIS_HOST) {
  try {
    redisConnection = new IORedis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: false,
      retryStrategy: (times) => (times > 10 ? null : Math.min(times * 200, 2000))
    });
    redisConnection.on("error", (err) => console.warn("Redis error:", err.message || err));
    redisConnection.on("connect", () => console.log("Redis connected"));
  } catch (err) {
    console.warn("Failed to initialize Redis client:", err.message || err);
    redisConnection = null;
  }
} else {
  console.log("REDIS_HOST not set — BullMQ disabled (delivery sweep will handle deliveries)");
}

export { redisConnection };
