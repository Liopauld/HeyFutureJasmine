import IORedis from "ioredis";

let redisConnection = null;
if (process.env.REDIS_HOST) {
  try {
    redisConnection = new IORedis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined
    });
    redisConnection.on("error", (err) => console.warn("Redis error:", err.message || err));
  } catch (err) {
    console.warn("Failed to initialize Redis client:", err.message || err);
    redisConnection = null;
  }
} else {
  console.log("REDIS_HOST not set — Redis disabled");
}

export { redisConnection };
