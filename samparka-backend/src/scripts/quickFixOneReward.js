/**
 * Quick Fix: Update a single L4 reward to be redeemable
 *
 * Usage:
 * node src/scripts/quickFixOneReward.js REWARD_ID
 *
 * Example:
 * node src/scripts/quickFixOneReward.js 507f1f77bcf86cd799439011
 */

const mongoose = require("mongoose");
const { getDatabaseConfig } = require("../config/database");

async function fixOneReward() {
  const rewardId = process.argv[2];

  if (!rewardId) {
    console.error("❌ Please provide a reward ID");
    console.log("Usage: node src/scripts/quickFixOneReward.js REWARD_ID");
    process.exit(1);
  }

  try {
    // Connect to database
    const dbConfig = getDatabaseConfig();
    console.log(`Connecting to ${dbConfig.name} database...`);
    await mongoose.connect(dbConfig.uri);
    console.log("✅ Connected to database");

    const Reward = mongoose.model("Reward", require("../models/rewardModel").schema);

    // Find the reward
    const reward = await Reward.findById(rewardId);

    if (!reward) {
      console.error(`❌ Reward not found with ID: ${rewardId}`);
      process.exit(1);
    }

    console.log(`\nFound reward:`);
    console.log(`  Name: ${reward.name}`);
    console.log(`  Type: ${reward.type}`);
    console.log(`  Redeemable: ${reward.redeemable}`);
    console.log(`  Point Cost: ${reward.pointCost || 'N/A'}`);

    // Update to redeemable
    reward.redeemable = true;
    await reward.save();

    console.log(`\n✅ Updated reward to redeemable: true`);
    console.log(`   Reward "${reward.name}" can now be redeemed!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixOneReward();
