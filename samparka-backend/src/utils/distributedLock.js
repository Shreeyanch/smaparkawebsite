const { connection } = require("../queue/index");

/**
 * Distributed lock using Redis for ensuring single execution across PM2 instances
 * Auto-expires after TTL to prevent deadlocks if process crashes
 */
class DistributedLock {
  /**
   * Acquire a distributed lock
   * @param {string} lockKey - Unique identifier for the lock
   * @param {number} ttlSeconds - Time-to-live in seconds (default: 600 = 10 minutes)
   * @returns {Promise<boolean>} - true if lock acquired, false if already locked
   */
  async acquire(lockKey, ttlSeconds = 600) {
    try {
      // SET NX (only if not exists) with expiry
      // Returns 'OK' if lock acquired, null if already exists
      const result = await connection.set(
        `lock:${lockKey}`,
        Date.now().toString(),
        "EX",
        ttlSeconds,
        "NX"
      );
      return result === "OK";
    } catch (error) {
      console.error(`❌ Failed to acquire lock ${lockKey}:`, error.message);
      return false;
    }
  }

  /**
   * Release a distributed lock
   * @param {string} lockKey - Unique identifier for the lock
   * @returns {Promise<boolean>} - true if lock released successfully
   */
  async release(lockKey) {
    try {
      await connection.del(`lock:${lockKey}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to release lock ${lockKey}:`, error.message);
      return false;
    }
  }

  /**
   * Check if a lock exists
   * @param {string} lockKey - Unique identifier for the lock
   * @returns {Promise<boolean>} - true if lock exists
   */
  async isLocked(lockKey) {
    try {
      const exists = await connection.exists(`lock:${lockKey}`);
      return exists === 1;
    } catch (error) {
      console.error(`❌ Failed to check lock ${lockKey}:`, error.message);
      return false;
    }
  }
}

module.exports = new DistributedLock();
