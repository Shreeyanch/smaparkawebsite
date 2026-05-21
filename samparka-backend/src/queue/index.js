// queue/index.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

// Validate environment variables
if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
  console.error("❌ Redis configuration missing! Check your .env file");
  console.error("Required: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD");
  process.exit(1);
}

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error("❌ Redis connection failed after 3 retries");
      return null; // Stop retrying
    }
    return Math.min(times * 1000, 3000);
  },
};

// Only add TLS if using Redis Cloud (secure connection)
if (
  process.env.REDIS_HOST.includes("redis.io") ||
  process.env.REDIS_TLS === "true"
) {
  redisConfig.tls = {};
}

const connection = new IORedis(redisConfig);

connection.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

connection.on("error", (err) => {
  console.error("❌ Redis connection error:", err.message);
});

const messageQueue = new Queue("wa-message-queue", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports = { messageQueue, connection };
