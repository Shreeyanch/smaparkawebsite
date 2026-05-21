# Subadmin "Claim Reward for Customer" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow store staff (subadmins) to claim rewards on behalf of customers from the store-side customer list, with immediate claimed status, across all store formats (Standard, L3, L4, L5, L6).

**Architecture:** Add a new `claimRewardForCustomer` endpoint in `storeController` that handles all formats in one place — validating permissions, checking eligibility, deducting points, creating the redemption record with `status: "claimed"` and `initiatedBy: "staff"`, and sending notifications. The frontend adds a gift-icon button per customer row that opens a simple reward-select modal, then calls the new endpoint.

**Tech Stack:** Express.js (CommonJS), Mongoose, React (Vite, Tailwind, lucide-react), nodemailer, Sparrow SMS

---

## Pre-requisites

- Ensure you are in the workspace root `/Users/krischalshrestha/Documents/work related/samparka/samparka_vps`.
- This plan assumes you have read the codebase research provided in the conversation above.

---

## Task 1: Add `letSubAdminToClaimRewards` to Store Model

**Files:**
- Modify: `samparka-backend/src/models/storeModel.js`

**Step 1:** Add the new boolean field right after `letSubAdminToGiveManualPoints` (around line 204).

```js
    letSubAdminToClaimRewards: {
      type: Boolean,
      required: true,
      default: true,
    },
```

**Expected:** Field added with default `true` so existing stores continue to work.

---

## Task 2: Add `initiatedBy` to Redemption Model

**Files:**
- Modify: `samparka-backend/src/models/redemptionModel.js`

**Step 1:** Add the new field inside the schema (after `billID`, around line 30).

```js
    initiatedBy: {
      type: String,
      enum: ["customer", "staff"],
      default: "customer",
    },
```

**Expected:** New field available on all future redemption documents.

---

## Task 3: Implement Backend `claimRewardForCustomer` Controller

**Files:**
- Modify: `samparka-backend/src/controllers/storeController.js`

**Step 1:** Add the new controller method **after** the existing `claimReward` method (after line 2725).

```js
  async claimRewardForCustomer(req, res) {
    try {
      const { storeURL } = req.params;
      const { customerId, rewardId, outletId } = req.body;

      const store = await storeModel.findOne({ url: storeURL });
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      if (store.letSubAdminToClaimRewards === false) {
        return res.json({ success: false, message: "Sub-admin reward claiming is disabled" });
      }

      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return res.json({ success: false, message: "Customer not found" });
      }

      const storeFormat = store.loyaltyCard?.format;
      let redemption, reward, rewardName, pointsDeducted = 0;

      // ── L5 Format ──
      if (storeFormat === "L5") {
        const CustomerOutletPoints = require("../models/CustomerOutletPoints");
        const L5Redemption = require("../models/l5RedemptionModel");
        const rewardModel = require("../models/rewardModel");
        const outletModel = require("../models/outletModel");
        const l5ControllerInstance = require("./l5Controller");
        const L5PointsTransaction = require("../models/L5PointsTransaction");

        if (!outletId) {
          return res.json({ success: false, message: "Outlet ID is required for L5 format" });
        }

        const rewardDoc = await rewardModel.findById(rewardId);
        if (!rewardDoc || rewardDoc.type !== "l5") {
          return res.json({ success: false, message: "Reward not found or invalid for L5" });
        }

        const numericThreshold = Number(rewardDoc.threshold);
        const outletPoints = await CustomerOutletPoints.findOne({
          customer: customerId,
          store: store._id,
          outlet: outletId,
        });

        if (!outletPoints || outletPoints.currentPoints < numericThreshold) {
          return res.json({
            success: false,
            message: `Insufficient points. Customer has ${outletPoints?.currentPoints || 0} points, needs ${numericThreshold}`,
          });
        }

        const outlet = await outletModel.findById(outletId);
        outletPoints.currentPoints -= numericThreshold;
        outletPoints.totalPointsRedeemed += numericThreshold;
        outletPoints.lastTransactionDate = new Date();
        await outletPoints.save();

        const l5Config = store.loyaltyCard?.l5Config || {};
        const validityDays = rewardDoc.validity && rewardDoc.validity !== "instant"
          ? parseInt(rewardDoc.validity) || l5Config.discountValidityDays || 30
          : (rewardDoc.validity === "instant" ? 0 : l5Config.discountValidityDays || 30);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + validityDays);

        redemption = await L5Redemption.create({
          store: store._id,
          customer: customerId,
          outlet: outletId,
          pointsThreshold: numericThreshold,
          pointsDeducted: numericThreshold,
          rewardType: rewardDoc.rewardType,
          discountPercentage: rewardDoc.discountPercentage,
          rewardName: rewardDoc.name,
          status: "used",
          expiryDate,
          usageDate: new Date(),
          usageOutlet: outletId,
        });

        await L5PointsTransaction.create({
          store: store._id,
          customer: customerId,
          outlet: outletId,
          transactionType: "redeem",
          points: -numericThreshold,
          balanceAfter: outletPoints.currentPoints,
          redemption: redemption._id,
          description: `Staff claimed ${rewardDoc.name || rewardDoc.discountPercentage + "% discount"} for customer`,
        });

        const allOutletPoints = await CustomerOutletPoints.find({ customer: customerId, store: store._id });
        const totalL5Points = allOutletPoints.reduce((sum, op) => sum + op.currentPoints, 0);
        await customerModel.findByIdAndUpdate(customerId, { points: totalL5Points, pointChangeDate: new Date() });

        await l5ControllerInstance.updateCustomerL5Data(customerId, store._id);

        rewardName = rewardDoc.name || "L5 Reward";
        pointsDeducted = numericThreshold;
        reward = rewardDoc;
      }
      // ── Standard Format ──
      else {
        const rewardModel = require("../models/rewardModel");
        const rewardDoc = await rewardModel.findById(rewardId);
        if (!rewardDoc) {
          return res.json({ success: false, message: "Reward not found" });
        }

        // Type validation per format
        if (storeFormat === "L4" && rewardDoc.type !== "l4") {
          return res.json({ success: false, message: "Invalid reward type for L4 store" });
        }
        if (storeFormat === "L6" && rewardDoc.type !== "l6") {
          return res.json({ success: false, message: "Invalid reward type for L6 store" });
        }
        if ((storeFormat === "L3" || storeFormat === "L34HA") && rewardDoc.type !== "constant") {
          return res.json({ success: false, message: "Invalid reward type for L3 store" });
        }
        if (!storeFormat || storeFormat === "standard") {
          if (rewardDoc.type !== "standard" && rewardDoc.type) {
            return res.json({ success: false, message: "Invalid reward type for standard store" });
          }
        }

        // Check redeemable
        if (!rewardDoc.redeemable && rewardDoc.type !== "constant") {
          return res.json({ success: false, message: "Reward is not redeemable" });
        }

        // Check tier match (L3, L4, L6)
        if (rewardDoc.tier && customer.tier !== rewardDoc.tier) {
          return res.json({ success: false, message: `This reward is only available for ${rewardDoc.tier} tier members` });
        }

        // Check redemption limit
        const redemptionCount = await redemptionModel.countDocuments({ customer: customerId, reward: rewardId });
        if (!rewardDoc.evergreen && redemptionCount >= (rewardDoc.redeemableTimes || 1)) {
          return res.json({ success: false, message: "Redemption limit reached for this reward" });
        }

        // Points check and deduction
        const pointCost = rewardDoc.points || rewardDoc.pointCost || 0;
        if (pointCost > 0 && customer.points < pointCost) {
          return res.json({ success: false, message: `Not enough points. Needs ${pointCost}, has ${customer.points}` });
        }

        if (pointCost > 0) {
          customer.points -= pointCost;
          customer.pointChangeDate = new Date();
          await customer.save();
          pointsDeducted = pointCost;
        }

        const outletLocation = store.services?.multipleOutlets
          ? (store.outlets?.find(o => o._id.toString() === outletId)?.location || "")
          : "";

        redemption = await redemptionModel.create({
          store: store._id,
          customer: customerId,
          reward: rewardId,
          status: "claimed",
          initiatedBy: "staff",
          outlet: outletLocation || null,
        });

        // L4 PointDeductionLog (since it's already claimed)
        if (storeFormat === "L4" && pointCost > 0) {
          try {
            const pointDeductionLogModel = require("../models/pointDeductionLogModel");
            const { calculateProportionalSplit } = require("../services/l4SettlementService");
            let outletContributions = [];
            if (store.services?.multipleOutlets) {
              try {
                outletContributions = await calculateProportionalSplit(customerId, store._id, pointCost);
              } catch (splitError) {
                console.error("❌ [claimRewardForCustomer L4] proportional split error:", splitError);
              }
            }
            await pointDeductionLogModel.create({
              customer: customerId,
              store: store._id,
              reward: rewardDoc._id,
              redemption: redemption._id,
              outlet: outletLocation || null,
              pointsDeducted: pointCost,
              balanceBefore: customer.points + pointCost,
              balanceAfter: customer.points,
              tier: customer.tier,
              reason: "reward_redemption",
              outletContributions,
            });
          } catch (logError) {
            console.error("❌ [claimRewardForCustomer] Failed to create PointDeductionLog:", logError);
          }
        }

        rewardName = rewardDoc.name;
        reward = rewardDoc;
      }

      // ── Notifications (use claim templates since reward is immediately claimed) ──
      const mailSMSModel = require("../models/mailSMSModel");
      const getMessage = await mailSMSModel.findOne({ store });

      // Email
      if (store.email && store.pass && getMessage?.mailAfterRewardClaimed?.subject) {
        try {
          await mailController.mailCustomers({
            user: store.email, pass: store.pass,
            host: store.host, port: store.port, secure: store.secure,
            email: customer.email,
            subject: getMessage.mailAfterRewardClaimed.subject,
            message: getMessage.mailAfterRewardClaimed.message,
            reward: rewardName, storeName: store.name, storeURL: store.url,
            storeLogo: store.logo,
            cardColor: store.loyaltyCard?.cardColor,
            textColor: store.loyaltyCard?.textColor,
            customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone,
          });
        } catch (e) { console.error("❌ Email notification error:", e); }
      }

      // SMS
      if (store.smsToken && getMessage?.smsAfterRewardClaimed?.message) {
        try {
          await smsController.smsCustomer({
            token: store.smsToken, to: customer.phone,
            from: getMessage.smsAfterRewardClaimed.from,
            message: getMessage.smsAfterRewardClaimed.message,
            reward: rewardName, storeName: store.name, storeURL: store.url,
            customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone,
          });
        } catch (e) { console.error("❌ SMS notification error:", e); }
      }

      // Push
      if (getMessage?.notificationAfterRewardClaimed?.body) {
        try {
          const notificationResponse = await notificationController.singleNotification({
            title: getMessage.notificationAfterRewardClaimed.title,
            body: getMessage.notificationAfterRewardClaimed.body,
            reward: rewardName, userId: customer._id,
            storeName: store.name, storeURL: store.url,
            customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone,
          });
          if (notificationResponse.success) {
            const notificationModel = require("../models/notificationModel");
            await new notificationModel({
              store: store._id,
              title: notificationResponse.formattedTitle || getMessage.notificationAfterRewardClaimed.title || "Notification",
              message: notificationResponse.formattedMessage || getMessage.notificationAfterRewardClaimed.body || "New notification received.",
              receivers: [{ customer: customer._id, read: false, readAt: null }],
            }).save();
          }
        } catch (e) { console.error("❌ Push notification error:", e); }
      }

      return res.json({ success: true, message: "Reward claimed successfully", redemption, pointsDeducted });
    } catch (error) {
      console.error("❌ claimRewardForCustomer error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
```

**Step 2:** Ensure the controller file already has the following requires at the top (they are already present based on research):
- `storeModel`, `customerModel`, `redemptionModel`, `rewardModel`, `mailSMSModel`
- `mailController`, `smsController`, `notificationController`

**Expected:** New method compiles and is available on the store controller singleton.

---

## Task 4: Add Route for `claimRewardForCustomer`

**Files:**
- Modify: `samparka-backend/src/routes/storeRoute.js`

**Step 1:** Add the new route after the existing `claimReward` route (around line 279).

```js
router.post(
  "/claimRewardForCustomer/:storeURL",
  storeMiddleware,
  storeController.claimRewardForCustomer
);
```

**Expected:** Endpoint reachable at `POST /store/claimRewardForCustomer/:storeURL` with store token auth.

---

## Task 5: Add Toggle in Store Settings (Frontend)

**Files:**
- Modify: `samparka-frontend/src/pages/StoreSettings.jsx`

**Step 1:** In the `customerSettings` state initialization area (around line 33), add:

```js
letSubAdminToClaimRewards: store?.letSubAdminToClaimRewards ?? true,
```

**Step 2:** In the `useEffect` that syncs settings from `store` data (around line 62), add:

```js
letSubAdminToClaimRewards: store?.letSubAdminToClaimRewards ?? true,
```

**Step 3:** In the Sub-Admin tab (around line 768, after the manual points toggle), add a new `SettingToggle`:

```jsx
                    <SettingToggle
                      label="Allow Sub-Admins to Claim Rewards"
                      description="Sub-admins can claim rewards on behalf of customers"
                      checked={customerSettings.letSubAdminToClaimRewards}
                      onChange={(val) => handleCustomerSettingChange('letSubAdminToClaimRewards', val)}
                      isDarkMode={isDarkMode}
                    />
```

**Expected:** Toggle appears in Store Settings > Sub-Admin Permissions tab.

---

## Task 6: Add Checkbox in AddStore Page

**Files:**
- Modify: `samparka-frontend/src/pages/admin/AddStore.jsx`

**Step 1:** In the `formData` initial state (around line 32), add:

```js
    letSubAdminToClaimRewards: true,
```

**Step 2:** In the form submission `FormData` append block (around line 164), add:

```js
        "letSubAdminToClaimRewards",
        formData.letSubAdminToClaimRewards
      );
      data.append(
```

*(Adjust placement — append after `letSubAdminToGiveManualPoints` block, making sure to close the previous `data.append` and start a new one for this field.)*

**Step 3:** In the Sub-Admin Permissions section of the form (around line 812, after the manual points checkbox), add:

```jsx
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="letSubAdminToClaimRewards"
                    checked={formData.letSubAdminToClaimRewards}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        letSubAdminToClaimRewards: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-black accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Let Sub Admin To Claim Rewards?
                  </span>
                </label>
```

**Expected:** Checkbox appears in the admin Add Store form.

---

## Task 7: Add Checkbox in EditStore Page

**Files:**
- Modify: `samparka-frontend/src/pages/EditStore.jsx`

**Step 1:** In the form submission `FormData` append block (around line 155), add:

```js
      data.append("letSubAdminToClaimRewards", formData.letSubAdminToClaimRewards);
```

**Step 2:** In the Sub-Admin Permissions section (around line 810, after the manual points checkbox), add:

```jsx
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="letSubAdminToClaimRewards"
                    checked={formData.letSubAdminToClaimRewards}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        letSubAdminToClaimRewards: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-green-500 accent-black"
                  />
                  <span
                    className={`ml-2 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                  >
                    Let Sub Admin To Claim Rewards?
                  </span>
                </label>
```

**Expected:** Checkbox appears in the Edit Store form.

---

## Task 8: Add Gift Button + Modal in Store Customers Page

**Files:**
- Modify: `samparka-frontend/src/pages/subdomainPages/storeSide/Customers.jsx`

### 8.1 Add new state variables

**Step 1:** After existing state declarations (around line 55), add:

```jsx
  const [claimRewardModalOpen, setClaimRewardModalOpen] = useState(false);
  const [claimRewardCustomer, setClaimRewardCustomer] = useState(null);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [selectedRewardId, setSelectedRewardId] = useState("");
  const [claimRewardLoading, setClaimRewardLoading] = useState(false);
```

### 8.2 Add function to open claim modal and fetch rewards

**Step 2:** Add this function near other handler functions (after `fetchOutletPointsForCustomer`, around line 340):

```jsx
  const openClaimRewardModal = async (customer) => {
    setClaimRewardCustomer(customer);
    setSelectedRewardId("");
    setClaimRewardModalOpen(true);
    try {
      const res = await api.get(`/reward/getRewards/${store._id}`);
      if (res.data.success) {
        const storeFormat = store?.loyaltyCard?.format;
        let rewards = res.data.rewards || [];
        // Filter rewards by format
        if (storeFormat === "L5") {
          // L5 rewards come from l5Config in the response
          const l5Rewards = res.data.l5Config?.rewards || [];
          setAvailableRewards(l5Rewards.map(r => ({
            _id: r._id || `l5-${r.threshold}`,
            name: r.rewardName || r.name || `${r.threshold} pts Reward`,
            threshold: r.threshold,
            rewardType: r.rewardType,
            discountPercentage: r.discountPercentage,
          })));
          return;
        }
        if (storeFormat === "L4") {
          rewards = rewards.filter(r => r.type === "l4");
        } else if (storeFormat === "L6") {
          rewards = rewards.filter(r => r.type === "l6");
        } else if (storeFormat === "L3" || storeFormat === "L34HA") {
          rewards = rewards.filter(r => r.type === "constant");
        } else {
          rewards = rewards.filter(r => !r.type || r.type === "standard");
        }
        setAvailableRewards(rewards);
      }
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
      toast.error("Failed to load rewards");
    }
  };
```

### 8.3 Add function to submit claim

**Step 3:** Add this function right after `openClaimRewardModal`:

```jsx
  const handleClaimReward = async () => {
    if (!selectedRewardId) {
      toast.error("Please select a reward");
      return;
    }
    setClaimRewardLoading(true);
    try {
      const outletId = localStorage.getItem("outletId");
      const res = await api.post(`/store/claimRewardForCustomer/${subdomain.url}`, {
        customerId: claimRewardCustomer._id,
        rewardId: selectedRewardId,
        outletId: outletId || undefined,
      });
      if (res.data.success) {
        toast.success(res.data.message || "Reward claimed successfully");
        setClaimRewardModalOpen(false);
        setClaimRewardCustomer(null);
        setSelectedRewardId("");
        // Refresh customer list to show updated points
        await fetchCustomers();
      } else {
        toast.error(res.data.message || "Failed to claim reward");
      }
    } catch (error) {
      console.error("Claim reward error:", error);
      toast.error(error?.response?.data?.message || "Failed to claim reward");
    } finally {
      setClaimRewardLoading(false);
    }
  };
```

### 8.4 Add gift button in desktop table row

**Step 4:** In the desktop table actions area (around line 933, inside the flex container with +/- buttons), add the gift button right after the `+` button:

```jsx
                          <button
                            className={`w-6 h-6 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center transition-colors ${
                              isDarkMode
                                ? "bg-purple-600 text-white hover:bg-purple-700"
                                : "bg-purple-500 text-white hover:bg-purple-600"
                            }`}
                            onClick={() => openClaimRewardModal(user)}
                            title="Claim Reward"
                          >
                            <Gift size={14} />
                          </button>
```

*(Make sure this button is only rendered when `store?.letSubAdminToClaimRewards !== false`.)*

Add the conditional wrapper:

```jsx
                          {store?.letSubAdminToClaimRewards !== false && (
                            <button
                              className={`w-6 h-6 lg:w-8 lg:h-8 rounded-xl flex items-center justify-center transition-colors ${
                                isDarkMode
                                  ? "bg-purple-600 text-white hover:bg-purple-700"
                                  : "bg-purple-500 text-white hover:bg-purple-600"
                              }`}
                              onClick={() => openClaimRewardModal(user)}
                              title="Claim Reward"
                            >
                              <Gift size={14} />
                            </button>
                          )}
```

### 8.5 Add gift button in mobile accordion

**Step 5:** In the mobile accordion actions area (around line 1405, after the Edit Customer button), add:

```jsx
                          {store?.letSubAdminToClaimRewards !== false && (
                            <button
                              onClick={() => openClaimRewardModal(user)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                isDarkMode
                                  ? "bg-purple-600 border-purple-500 text-white hover:bg-purple-700"
                                  : "bg-purple-500 border-purple-400 text-white hover:bg-purple-600"
                              }`}
                            >
                              <Gift size={14} />
                              Claim Reward
                            </button>
                          )}
```

### 8.6 Add the Claim Reward Modal JSX

**Step 6:** Add the modal JSX near the other modals (after the Outlet Points Modal, around line 680). Use the same inline overlay pattern as other modals in this file:

```jsx
      {/* Claim Reward Modal */}
      {claimRewardModalOpen && claimRewardCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div
            className={`w-full max-w-md rounded-2xl shadow-xl overflow-hidden ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className={`px-6 py-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Claim Reward
              </h3>
              <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                For {claimRewardCustomer.name}
              </p>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Select Reward
                </label>
                <select
                  value={selectedRewardId}
                  onChange={(e) => setSelectedRewardId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? "bg-gray-900 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Choose a reward...</option>
                  {availableRewards.map((reward) => (
                    <option key={reward._id} value={reward._id}>
                      {reward.name}
                      {reward.threshold ? ` (${reward.threshold} pts)` : ""}
                      {reward.points ? ` (${reward.points} pts)` : ""}
                      {reward.pointCost ? ` (${reward.pointCost} pts)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRewardId && (
                <div className={`p-3 rounded-lg text-sm ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-700"}`}>
                  <p>Reward will be claimed immediately for <strong>{claimRewardCustomer.name}</strong>.</p>
                  <p className="mt-1">Customer points after claim: <strong>{Math.max(0, (claimRewardCustomer.points || 0) - (availableRewards.find(r => r._id === selectedRewardId)?.points || availableRewards.find(r => r._id === selectedRewardId)?.pointCost || availableRewards.find(r => r._id === selectedRewardId)?.threshold || 0))}</strong></p>
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <button
                onClick={() => {
                  setClaimRewardModalOpen(false);
                  setClaimRewardCustomer(null);
                  setSelectedRewardId("");
                }}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                disabled={claimRewardLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleClaimReward}
                disabled={!selectedRewardId || claimRewardLoading}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  !selectedRewardId || claimRewardLoading
                    ? "bg-purple-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {claimRewardLoading ? "Claiming..." : "Claim Reward"}
              </button>
            </div>
          </div>
        </div>
      )}
```

**Expected:** Gift button appears in both desktop and mobile customer rows. Clicking opens a modal to select a reward and claim it.

---

## Task 9: Show "Staff" Badge in ViewRewards

**Files:**
- Modify: `samparka-frontend/src/pages/subdomainPages/storeSide/ViewRewards.jsx`

**Step 1:** In the Status column rendering (around line 491), change the status badge to also show "Staff" when `reward.initiatedBy === "staff"`:

```jsx
                    <td className="px-3 xl:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            reward.status
                          )}`}
                        >
                          •{" "}
                          {reward.status.charAt(0).toUpperCase() +
                            reward.status.slice(1)}
                        </span>
                        {reward.initiatedBy === "staff" && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            Staff
                          </span>
                        )}
                      </div>
                    </td>
```

**Step 2:** Do the same for the mobile accordion status display (search for the mobile status badge and add the same conditional `Staff` span).

**Expected:** Staff-initiated redemptions show a purple "Staff" badge next to the status in ViewRewards.

---

## Task 10: Lint & Manual Verification

**Files:** None (verification only)

**Step 1:** Run frontend lint.

```bash
cd /Users/krischalshrestha/Documents/work\ related/samparka/samparka_vps/samparka-frontend && yarn lint
```

**Expected:** No new lint errors introduced.

**Step 2:** Start the backend dev server and verify the new route responds.

```bash
cd /Users/krischalshrestha/Documents/work\ related/samparka/samparka_vps/samparka-backend && npm run dev
```

*(In another terminal or after stopping lint)* Test with curl or Postman:

```bash
curl -X POST http://localhost:5000/store/claimRewardForCustomer/himalayanjavaexpress \
  -H "Content-Type: application/json" \
  -H "token: <STORE_JWT>" \
  -d '{"customerId":"...","rewardId":"...","outletId":"69072603855145c31a9eadb7"}'
```

**Expected:** `{"success":true,"message":"Reward claimed successfully"}`

---

## Summary of Files Changed

| # | File | Action | Lines Approx |
|---|------|--------|-------------|
| 1 | `samparka-backend/src/models/storeModel.js` | Add field | ~205 |
| 2 | `samparka-backend/src/models/redemptionModel.js` | Add field | ~31 |
| 3 | `samparka-backend/src/controllers/storeController.js` | Add method | ~2726-2900 |
| 4 | `samparka-backend/src/routes/storeRoute.js` | Add route | ~280 |
| 5 | `samparka-frontend/src/pages/StoreSettings.jsx` | Add toggle | ~33, 62, 768 |
| 6 | `samparka-frontend/src/pages/admin/AddStore.jsx` | Add checkbox | ~32, 164, 812 |
| 7 | `samparka-frontend/src/pages/EditStore.jsx` | Add checkbox | ~155, 810 |
| 8 | `samparka-frontend/src/pages/subdomainPages/storeSide/Customers.jsx` | Add UI + modal | ~55, 340, 933, 1405, 680 |
| 9 | `samparka-frontend/src/pages/subdomainPages/storeSide/ViewRewards.jsx` | Add badge | ~491 |

---

## Design Notes

- **Button style:** Purple (`bg-purple-500`/`bg-purple-600`) rounded-xl, same size as +/- buttons (24x24 mobile, 32x32 desktop), `Gift` icon from `lucide-react`.
- **Modal style:** Matches existing modals — `fixed inset-0 bg-black/50 backdrop-blur-sm`, centered card with header, body, footer. Dark mode aware via `isDarkMode`.
- **Reward filtering:** Rewards are fetched once per modal open from `/reward/getRewards/:storeId`, then filtered client-side by store format.
- **Points preview:** Modal shows approximate remaining points after deduction based on the selected reward's cost.
- **L5 outlet:** Automatically passed from `localStorage.getItem("outletId")`. Backend validates `CustomerOutletPoints` for that outlet.
- **Notifications:** Reuses existing `mailAfterRewardClaimed`, `smsAfterRewardClaimed`, `notificationAfterRewardClaimed` templates so no new template configuration is needed.
