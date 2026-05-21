/**
 * Migration Script: Fix L4 Rewards Redeemable Status
 *
 * This script updates all existing L4 rewards to set redeemable = true
 * so they can be redeemed by customers.
 *
 * Run this once to fix existing rewards:
 * node src/scripts/fixL4RewardsRedeemable.js
 */

const mongoose = require("mongoose");
const { getDatabaseConfig } = require("../config/database");

async function fixL4Rewards() {
  try {
    // Connect to database
    const dbConfig = getDatabaseConfig();
    console.log(`Connecting to ${dbConfig.name} database...`);
    await mongoose.connect(dbConfig.uri);
    console.log("✅ Connected to database");

    const Reward = mongoose.model("Reward", require("../models/rewardModel").schema);

    // Find all L4 rewards that are not redeemable
    const l4RewardsNotRedeemable = await Reward.find({
      type: "l4",
      redeemable: { $ne: true },
    });

    console.log(`\nFound ${l4RewardsNotRedeemable.length} L4 rewards that are not redeemable`);

    if (l4RewardsNotRedeemable.length === 0) {
      console.log("✅ All L4 rewards are already redeemable. No migration needed.");
      process.exit(0);
    }

    // Display rewards to be updated
    console.log("\nRewards to be updated:");
    l4RewardsNotRedeemable.forEach((reward, index) => {
      console.log(`${index + 1}. ${reward.name} (ID: ${reward._id}) - Store: ${reward.store}`);
    });

    // Update all L4 rewards to be redeemable
    const result = await Reward.updateMany(
      {
        type: "l4",
        redeemable: { $ne: true }
      },
      {
        $set: { redeemable: true }
      }
    );

    console.log(`\n✅ Successfully updated ${result.modifiedCount} L4 rewards`);
    console.log(`   - Matched: ${result.matchedCount}`);
    console.log(`   - Modified: ${result.modifiedCount}`);

    // Verify the update
    const stillNotRedeemable = await Reward.countDocuments({
      type: "l4",
      redeemable: { $ne: true },
    });

    if (stillNotRedeemable === 0) {
      console.log("\n✅ Migration completed successfully!");
      console.log("All L4 rewards are now redeemable.");
    } else {
      console.log(`\n⚠️  Warning: ${stillNotRedeemable} L4 rewards still not redeemable`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

// Run the migration
fixL4Rewards();
