# Testing Points Expiry Feature

This guide explains how to manually test the points expiry cron job in development.

## Quick Start

```bash
# 1. Setup test data (sets a customer's points to expire)
npm run setup:expiry

# 2. Run the expiry check manually
npm run test:expiry
```

---

## Detailed Testing Guide

### Prerequisites

1. **Enable expiry on a store:**
   - Go to your store settings in the admin panel
   - Set `hasExpiry: true`
   - Set `expiryDays: 30` (or any value between 30-365)

2. **Have customers with points:**
   - For **L4 stores**: Customers need `Customer.points > 0`
   - For **L5 stores**: Customers need points in `CustomerOutletPoints` records

---

## Step 1: Setup Test Data

### Option A: Use Default Settings (Easiest)

```bash
npm run setup:expiry
```

This will:
- Find the first store with `hasExpiry: true`
- Find the first customer with points > 0
- Set their `pointChangeDate` to be already expired (31 days ago if expiryDays=30)

### Option B: Specify Store and Customer

```bash
npm run setup:expiry <storeId> <customerPhone> <scenario>
```

**Scenarios:**
- `1` - Points expire TOMORROW (triggers 1-day notification)
- `2` - Points expire in 3 DAYS (triggers 3-day notification)
- `3` - Points expire in 7 DAYS (triggers 7-day notification)
- `4` - Points ALREADY EXPIRED (default - will reset immediately)
- `5` - Custom days ago (requires additional argument)

**Examples:**

```bash
# Test with specific customer (already expired)
npm run setup:expiry 65abc123def456789 9841234567 4

# Test 1-day notification
npm run setup:expiry 65abc123def456789 9841234567 1

# Test 7-day notification
npm run setup:expiry 65abc123def456789 9841234567 3

# Custom: Set to 50 days ago
npm run setup:expiry 65abc123def456789 9841234567 5 50
```

### Option C: Manual Database Update

You can also manually update a customer in MongoDB:

```javascript
// In MongoDB shell or Compass
db.customers.updateOne(
  { _id: ObjectId("your-customer-id") },
  {
    $set: {
      pointChangeDate: new Date("2025-01-01") // Old date
    }
  }
)
```

---

## Step 2: Run the Expiry Test

```bash
npm run test:expiry
```

### What This Does

The test script will:
1. Connect to your MongoDB database
2. Find all stores with `hasExpiry: true`
3. Check all customers with `pointChangeDate` set
4. Calculate days until expiry
5. Perform actions based on days remaining:
   - **7, 3, or 1 days**: Send notification
   - **0 or negative days**: Expire points

### Expected Output

```
============================================================
🧪 TESTING POINTS EXPIRY LOGIC
============================================================
✅ Connected to MongoDB

------------------------------------------------------
Checking for expiring points...
------------------------------------------------------

📊 Found 2 store(s) with expiry enabled

🏪 Processing Store: Coffee House Nepal
   Format: L5
   Expiry Days: 30
   Customers with points: 3

   👤 Customer: John Doe
      Last Updated: 1/1/2025
      Expiration Date: 1/31/2025
      Current Points: 1500
      Days Until Expiry: -14
      🗑️ EXPIRING POINTS (14 days overdue)
      📍 L5 Format - Checking outlet points...
         Outlets with points: 2
         - Thamel Branch: 800 points
         - Patan Branch: 700 points
         ✅ Transaction record created for Thamel Branch
         ✅ Transaction record created for Patan Branch
      ✅ L5 points reset (Customer + 2 outlet(s))

   👤 Customer: Jane Smith
      Last Updated: 2/10/2025
      Expiration Date: 3/12/2025
      Current Points: 500
      Days Until Expiry: 3
      ⏰ NOTIFICATION: 3 days remaining
      ✅ Notification sent successfully

============================================================
✅ EXPIRY TEST COMPLETED
============================================================
```

---

## Step 3: Verify the Results

### For L4 Format Stores

Check that:
1. ✅ `Customer.points` = 0
2. ✅ `Customer.pointChangeDate` = null

```bash
# MongoDB query
db.customers.findOne({ _id: ObjectId("customer-id") })
```

### For L5 Format Stores

Check that:
1. ✅ `Customer.points` = 0
2. ✅ `Customer.pointChangeDate` = null
3. ✅ ALL `CustomerOutletPoints.currentPoints` = 0
4. ✅ `CustomerOutletPoints.totalPointsEarned` and `totalPointsRedeemed` preserved (NOT reset)
5. ✅ `L5PointsTransaction` records created with `transactionType: "expiry"`

```bash
# MongoDB queries

# Check customer
db.customers.findOne({ _id: ObjectId("customer-id") })

# Check outlet points
db.customeroutletpoints.find({ customer: ObjectId("customer-id") })

# Check expiry transactions
db.l5pointstransactions.find({
  customer: ObjectId("customer-id"),
  transactionType: "expiry"
}).sort({ createdAt: -1 })
```

---

## Testing Different Scenarios

### Scenario 1: Test L4 Format (No Regression)

```bash
# Setup
# 1. Find an L4 store with hasExpiry: true
# 2. Find a customer in that store with points

# Set points to expire
npm run setup:expiry <L4-store-id> <customer-phone> 4

# Run expiry
npm run test:expiry

# Verify in MongoDB
# - Customer.points should be 0
# - pointChangeDate should be null
# - NO CustomerOutletPoints records should be affected
```

### Scenario 2: Test L5 Format (The Fix)

```bash
# Setup
# 1. Find an L5 store with hasExpiry: true
# 2. Find a customer with points at multiple outlets

# Set points to expire
npm run setup:expiry <L5-store-id> <customer-phone> 4

# Run expiry
npm run test:expiry

# Verify in MongoDB
# - Customer.points should be 0
# - ALL CustomerOutletPoints.currentPoints should be 0
# - totalPointsEarned/Redeemed should be unchanged
# - L5PointsTransaction records created for each outlet
```

### Scenario 3: Test Expiry Notifications

```bash
# Test 7-day notification
npm run setup:expiry <store-id> <customer-phone> 3
npm run test:expiry
# Check: Notification sent, points NOT reset

# Test 3-day notification
npm run setup:expiry <store-id> <customer-phone> 2
npm run test:expiry
# Check: Notification sent, points NOT reset

# Test 1-day notification
npm run setup:expiry <store-id> <customer-phone> 1
npm run test:expiry
# Check: Notification sent, points NOT reset
```

### Scenario 4: Test Multi-Outlet Activity (L5)

This tests the requirement: "Points expire when customer has NOT received points from ANY outlet"

```bash
# Setup in MongoDB or via API:
# 1. Customer earns 500 points at Outlet A on Day 1
# 2. Customer earns 300 points at Outlet B on Day 20
# 3. Customer.pointChangeDate should be Day 20 (latest activity)

# On Day 35 (15 days after last activity):
npm run setup:expiry <store-id> <customer-phone> 5 15
npm run test:expiry
# Expected: Points NOT expired (only 15 days since last activity)

# On Day 51 (31 days after last activity):
npm run setup:expiry <store-id> <customer-phone> 5 31
npm run test:expiry
# Expected: ALL points expired (31 days > 30 day expiry)
```

---

## Option 2: Test Using MongoDB Directly

If you prefer to test without scripts:

### 1. Set pointChangeDate in MongoDB

```javascript
// Find a customer
const customer = db.customers.findOne({
  store: ObjectId("your-store-id"),
  points: { $gt: 0 }
})

// Set to 35 days ago (expired if expiryDays = 30)
db.customers.updateOne(
  { _id: customer._id },
  {
    $set: {
      pointChangeDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
    }
  }
)
```

### 2. Extract Cron Logic to Test Function

Create a temporary route in your Express app:

```javascript
// In a test controller or route
router.post("/test/expiry", async (req, res) => {
  // Copy the cron job logic from cornJob.js lines 341-489
  // Run it once
  res.json({ success: true, message: "Expiry test completed" });
});
```

Then trigger via:
```bash
curl -X POST http://localhost:5000/api/test/expiry
```

---

## Option 3: Temporarily Modify Cron Schedule

Change the cron schedule to run every minute for testing:

```javascript
// In cornJob.js, temporarily change:
cron.schedule("0 8 * * *", async () => {
// To:
cron.schedule("* * * * *", async () => {  // Runs every minute
```

**Don't forget to change it back!**

---

## Cleanup After Testing

After testing, you may want to restore test data:

```bash
# Option 1: Restore from backup
npm run restore

# Option 2: Manually reset customers in MongoDB
db.customers.updateMany(
  { pointChangeDate: null },
  {
    $set: {
      pointChangeDate: new Date()  // Reset to current date
    }
  }
)
```

---

## Production Testing Checklist

Before deploying to production:

- [ ] Test L4 format expiry (verify no regression)
- [ ] Test L5 format expiry with single outlet
- [ ] Test L5 format expiry with multiple outlets
- [ ] Test notifications at 7, 3, and 1 days
- [ ] Test that totalPointsEarned/Redeemed are NOT reset
- [ ] Test L5 transaction records are created
- [ ] Verify no errors in logs
- [ ] Test edge cases (customers with 0 points, no pointChangeDate, etc.)
- [ ] Monitor first production run closely

---

## Troubleshooting

### Issue: "No stores found with hasExpiry: true"

**Solution:** Enable expiry on a store first:
```javascript
db.stores.updateOne(
  { _id: ObjectId("store-id") },
  { $set: { hasExpiry: true, expiryDays: 30 } }
)
```

### Issue: "Customer not found with points"

**Solution:** Award points to a customer first via the app or:
```javascript
db.customers.updateOne(
  { phone: "9841234567" },
  {
    $set: {
      points: 1000,
      pointChangeDate: new Date()
    }
  }
)
```

### Issue: CustomerOutletPoints not found (L5)

**Solution:** Ensure customer has earned points at an outlet via the L5 earnPoints endpoint.

---

## Questions?

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify MongoDB connection in `.env`
3. Ensure models are properly imported
4. Check that store has `hasExpiry: true` and `expiryDays` set
