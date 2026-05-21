"use strict";

const mongoose = require("mongoose");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = require("../config/s3Config");
const receiptSubmissionModel = require("../models/receiptSubmissionModel");
const customerModel = require("../models/customerModel");
const storeModel = require("../models/storeModel");
const outletModel = require("../models/outletModel");
const customerOutletPointsModel = require("../models/customerOutletPointsModel");
const l5PointsTransactionModel = require("../models/l5PointsTransactionModel");
const pointsHistoryModel = require("../models/pointsHistoryModel");

const ocrService = require("../services/ocrService");
const { buildReceiptHash, analyzeReceipt } = require("../services/receiptFraudService");
const { calculateReceiptPoints } = require("../services/receiptPointsService");
const { updateMissionProgress } = require("../services/missionProgressService");
const { updateVisitAnalytics } = require("../services/visitAnalyticsService");
const responseHandler = require("../utils/responseHandler");
const notificationController = require("./notificationController");

const S3_BUCKET = "samparka";
const SIGNED_URL_TTL = 3600; // 1 hour

class ReceiptController {
  // ─── Internal: Upload image to S3 ───────────────────────────────────────────
  _uploadToS3 = async (buffer, mimeType) => {
    const ext = mimeType.split("/")[1] || "jpg";
    const key = `receipts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );
    return key;
  };

  // ─── Internal: Generate signed S3 URL for image viewing ────────────────────
  _getSignedImageUrl = async (key) => {
    try {
      return await getSignedUrl(
        s3,
        new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
        { expiresIn: SIGNED_URL_TTL }
      );
    } catch (_) {
      return null;
    }
  };

  // ─── Internal: Award points (L5 or standard path) ───────────────────────────
  _awardPoints = async ({ submission, store, customer, outlet, points }) => {
    if (!points || points <= 0) return;

    // Double points check
    if (store?.doublePoints && Array.isArray(store.doublePointsDays) && store.doublePointsDays.length > 0) {
      const tz = store.timezone || 'Asia/Kathmandu';
      const dayIndex = new Date(new Date().toLocaleString('en-US', { timeZone: tz })).getDay();
      if (store.doublePointsDays.includes(dayIndex)) {
        points = parseFloat((points * 2).toFixed(1));
        console.log(`✅ Double points (receipt): day=${dayIndex}, doubled to ${points}`);
      }
    }

    const isL5 = store.loyaltyCard?.format === "L5";

    if (isL5 && outlet) {
      // L5 path — update CustomerOutletPoints + create L5PointsTransaction
      let outletPoints = await customerOutletPointsModel.findOne({
        customer: customer._id,
        store: store._id,
        outlet: outlet._id,
      });

      if (!outletPoints) {
        outletPoints = new customerOutletPointsModel({
          customer: customer._id,
          store: store._id,
          outlet: outlet._id,
          currentPoints: 0,
          totalPointsEarned: 0,
          totalPointsRedeemed: 0,
        });
      }

      outletPoints.currentPoints = parseFloat((outletPoints.currentPoints + points).toFixed(1));
      outletPoints.totalPointsEarned = parseFloat((outletPoints.totalPointsEarned + points).toFixed(1));
      outletPoints.lastTransactionDate = new Date();
      await outletPoints.save();

      const txn = await l5PointsTransactionModel.create({
        store: store._id,
        customer: customer._id,
        outlet: outlet._id,
        transactionType: "earn",
        points,
        balanceAfter: outletPoints.currentPoints,
        billID: submission.extractedData?.receiptNumber || null,
        billAmount: submission.extractedData?.totalAmount || null,
        description: `Earned ${points} pts via receipt scan`,
        referenceType: "bill",
        referenceId: submission._id,
      });

      await customerModel.findByIdAndUpdate(customer._id, {
        $inc: { points },
        pointChangeDate: new Date(),
      });

      submission.pointsAwarded = points;
      submission.transactionRef = txn._id;
      submission.transactionRefModel = "L5PointsTransaction";
      await submission.save();
    } else {
      // Standard path (L1–L4)
      await customerModel.findByIdAndUpdate(customer._id, {
        $inc: { points, totalPoints: points },
        pointChangeDate: new Date(),
      });

      const ph = await pointsHistoryModel.create({
        points,
        billID: submission.extractedData?.receiptNumber || null,
        store: store._id,
        outlet: outlet?.location?.toString() || null,
        customer: customer._id,
        remarks: ``,
      });

      submission.pointsAwarded = points;
      submission.transactionRef = ph._id;
      submission.transactionRefModel = "PointsHistory";
      await submission.save();
    }

    // Update visit analytics so receipt scans appear in outlet performance
    try {
      const outletIdentifier = outlet?.location?.toString() || outlet?.name || null;
      await updateVisitAnalytics(customer._id, store._id, outletIdentifier, points);
      console.log(`✅ Receipt scan analytics updated for customer ${customer._id}`);
    } catch (analyticsErr) {
      console.error("❌ Analytics update failed (non-fatal):", analyticsErr.message);
    }

    // Send push notification (non-fatal)
    try {
      await notificationController.singleNotification({
        title: "Points Awarded!",
        body: `You earned ${points} points for your receipt.`,
        userId: customer._id,
        points,
        storeName: store.name,
        storeURL: store.url,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        storeId: store._id,
      });
    } catch (notifErr) {
      console.error("❌ Notification error (non-fatal):", notifErr.message);
    }

    console.log(`✅ Awarded ${points} points to customer ${customer._id}`);
  };

  // ─── Internal: Core submission processing ───────────────────────────────────
  _processSubmission = async ({ buffer, mimeType, store, customer, outlet, submittedBy, processedBy, extractedOverrides = {}, providerOverride = null }) => {
    // 1. Upload image to S3 (permanent storage)
    console.log(`   [1/7] Uploading image to S3...`);
    const imageKey = await this._uploadToS3(buffer, mimeType);
    console.log(`   [1/7] ✅ S3 upload done → ${imageKey}`);

    // 2. OCR extraction — use providerOverride, then store's configured provider, then default
    const ocrProvider = providerOverride || store.receiptScan?.ocrProvider || null;
    console.log(`   [2/7] Running OCR${ocrProvider ? ` (provider: ${ocrProvider})` : ""}...`);
    let extractedData = {};
    try {
      extractedData = await ocrService.extractReceiptData(buffer, mimeType, ocrProvider);
      console.log(`   [2/7] ✅ OCR done — provider=${extractedData.ocrProvider}, confidence=${extractedData.confidence}, total=${extractedData.totalAmount}`);
      const itemCount = extractedData.items?.length || 0;
      if (itemCount > 0) {
        console.log(`   [2/7] 📦 Items extracted (${itemCount}):`);
        extractedData.items.forEach((item, i) => {
          console.log(`          [${i + 1}] "${item.name}" qty=${item.quantity} price=${item.price}`);
        });
      } else {
        console.log(`   [2/7] ⚠️  No line items extracted from receipt`);
      }
    } catch (ocrErr) {
      console.error(`   [2/7] ❌ OCR failed (non-fatal): ${ocrErr.message}`);
      extractedData = { confidence: 0, ocrProvider: "failed", items: [] };
    }

    // 2a. Merge user-confirmed overrides (from confirm screen) — these take precedence over OCR
    if (Object.values(extractedOverrides).some(Boolean)) {
      console.log(`   [2a]  Applying confirmed overrides: total=${extractedOverrides.totalAmount || "-"}, date=${extractedOverrides.receiptDate || "-"}, store=${extractedOverrides.storeName || "-"}, bill#=${extractedOverrides.receiptNumber || "-"}`);
    }
    if (extractedOverrides.storeName) extractedData.storeName = extractedOverrides.storeName;
    if (extractedOverrides.customerName) extractedData.customerName = extractedOverrides.customerName;
    if (extractedOverrides.receiptNumber) extractedData.receiptNumber = extractedOverrides.receiptNumber;
    if (extractedOverrides.receiptDate) extractedData.receiptDate = extractedOverrides.receiptDate;
    if (extractedOverrides.totalAmount != null) {
      const amt = parseFloat(extractedOverrides.totalAmount);
      if (!isNaN(amt) && amt > 0) extractedData.totalAmount = amt;
    }

    // 3. Build content fingerprint (Layer 2 hash)
    console.log(`   [3/7] Building receipt hash...`);
    const receiptHash = buildReceiptHash(
      extractedData.receiptNumber,
      extractedData.receiptDate,
      extractedData.totalAmount,
      store._id.toString()
    );
    console.log(`   [3/7] ✅ Hash: ${receiptHash}`);

    // 4. Fraud analysis (runs Layer 1 + Layer 2 + all signals)
    console.log(`   [4/7] Running fraud analysis...`);
    const { fraudScore, fraudFlags, isDuplicate } = await analyzeReceipt({
      extracted: extractedData,
      store,
      customerId: customer._id.toString(),
      receiptHash,
    });
    const activeFlagNames = Object.entries(fraudFlags || {}).filter(([, v]) => v).map(([k]) => k).join(", ");
    console.log(`   [4/7] ✅ Fraud: score=${fraudScore}, duplicate=${isDuplicate}, flags=[${activeFlagNames || "none"}]`);

    // 5. Calculate points
    console.log(`   [5/7] Calculating points...`);
    const scanConfig = store.receiptScan || {};
    const pointsMode = scanConfig.pointsMode || "total_based";
    const { points: calculatedPoints } = await calculateReceiptPoints({
      store,
      extractedData,
      pointsMode,
    });
    console.log(`   [5/7] ✅ Points: ${calculatedPoints} (mode=${pointsMode})`);

    // 6. Determine status based on fraud result + configurable auto-approval thresholds
    const autoApproveMaxFraud = scanConfig.autoApproveMaxFraudScore ?? 40;
    const autoApproveMinConf  = scanConfig.autoApproveMinConfidence ?? 0.6;
    const confidence = extractedData.confidence || 0;
    const approvalMode = scanConfig.approvalMode || "hold";
    let status;

    if (isDuplicate) {
      status = "rejected";
    } else if (fraudScore >= 70) {
      // High fraud risk → always hold regardless of mode/thresholds
      status = "pending";
    } else if (fraudScore <= autoApproveMaxFraud && confidence >= autoApproveMinConf) {
      // Smart auto-approve: both configured thresholds met
      status = "auto_approved";
    } else if (approvalMode === "auto_flag") {
      status = fraudScore >= 40 ? "flagged" : "auto_approved";
    } else if (approvalMode === "fully_automated") {
      status = "auto_approved";
    } else {
      status = "pending";
    }
    console.log(`   [6/7] Status determined: ${status} (fraudScore=${fraudScore}, confidence=${confidence.toFixed(2)}, autoMaxFraud=${autoApproveMaxFraud}, autoMinConf=${autoApproveMinConf})`);

    // 7. Create ReceiptSubmission record
    console.log(`   [7/7] Saving submission to DB...`);
    const submission = await receiptSubmissionModel.create({
      customer: customer._id,
      store: store._id,
      outlet: outlet?._id,
      submittedBy,
      processedBy,
      imageKey,
      extractedData,
      receiptHash,
      calculatedPoints,
      pointsMode,
      status,
      approvalMode,
      fraudScore,
      fraudFlags,
    });

    console.log(`   [7/7] ✅ Submission saved → ${submission._id}`);

    // 8. Award points immediately for auto_approved or flagged
    if (status === "auto_approved" || status === "flagged") {
      console.log(`   [8]  Awarding ${calculatedPoints} points (status=${status})...`);
      await this._awardPoints({ submission, store, customer, outlet, points: calculatedPoints });
      // Update L6 mission progress based on purchased items (non-fatal)
      if (store.loyaltyCard?.format === "L6") {
        await updateMissionProgress({
          store,
          customer,
          items: extractedData.items || [],
          receiptDate: extractedData.receiptDate,
          submissionCreatedAt: submission.createdAt,
        });
      }
    }

    return submission;
  };

  // ─── POST /api/receipts/extract ─────────────────────────────────────────────
  // Auth: customerMiddleware
  // OCR only — no DB write, no S3, no fraud check. Used by confirm screen.
  // Query param: ?provider=paddleocr|google_vision|openai|gemini (optional, for admin testing)
  extractOnly = async (req, res) => {
    try {
      if (!req.file) {
        return responseHandler.error(res, "Receipt image is required");
      }

      const customerId = req.user?._id;
      const { originalname, size, mimetype } = req.file;
      const providerOverride = req.query.provider || null;

      // Validate provider if override is supplied
      const validProviders = ["paddleocr", "google_vision", "openai", "gemini", "aws_textract"];
      if (providerOverride && !validProviders.includes(providerOverride)) {
        return responseHandler.error(
          res,
          `Invalid OCR provider "${providerOverride}". Valid options: ${validProviders.join(", ")}`
        );
      }

      console.log(`\n📷 [Receipt OCR] ─────────────────────────────────────────`);
      console.log(`   Customer  : ${customerId}`);
      console.log(`   File      : ${originalname} (${Math.round(size / 1024)} KB, ${mimetype})`);
      if (providerOverride) {
        console.log(`   Provider  : ${providerOverride} (admin override)`);
      }
      console.log(`   Step      : Sending to OCR service...`);

      const extracted = await ocrService.extractReceiptData(req.file.buffer, mimetype, providerOverride);

      console.log(`✅ [Receipt OCR] Complete`);
      console.log(`   Provider  : ${extracted.ocrProvider}`);
      console.log(`   Confidence: ${extracted.confidence}`);
      console.log(`   Total     : ${extracted.totalAmount}`);
      console.log(`   Date      : ${extracted.receiptDate}`);
      console.log(`   Store     : ${extracted.storeName}`);
      console.log(`──────────────────────────────────────────────────────────\n`);

      return responseHandler.success(res, extracted, "OCR extraction complete");
    } catch (error) {
      console.error("❌ [Receipt OCR] Failed:", error.message);
      return responseHandler.serverError(res, "OCR extraction failed");
    }
  };

  // ─── POST /api/receipts/submit/customer ─────────────────────────────────────
  // Auth: customerMiddleware
  submitReceipt = async (req, res) => {
    try {
      const customer = req.user;
      const store = await storeModel.findById(customer.store);

      if (!store?.receiptScan?.enabled) {
        return responseHandler.error(res, "Receipt scanning is not enabled for this store");
      }
      if (!req.file) {
        return responseHandler.error(res, "Receipt image is required");
      }

      let outlet = null;
      if (req.body.outletId) {
        outlet = await outletModel.findById(req.body.outletId);
      }

      // Accept optional field overrides from the confirm screen
      const { storeName, receiptNumber, receiptDate, totalAmount } = req.body;
      const extractedOverrides = { storeName, receiptNumber, receiptDate, totalAmount };

      console.log(`\n🧾 [Receipt Submit] ───────────────────────────────────────`);
      console.log(`   Customer  : ${customer._id} (${customer.name})`);
      console.log(`   Store     : ${store._id} (${store.name})`);
      console.log(`   Outlet    : ${outlet?._id || "none"}`);
      console.log(`   File      : ${req.file.originalname} (${Math.round(req.file.size / 1024)} KB)`);
      console.log(`   Overrides : total=${totalAmount || "-"}, date=${receiptDate || "-"}, store=${storeName || "-"}, bill#=${receiptNumber || "-"}`);
      console.log(`   Step      : Starting full submission pipeline...`);

      const submission = await this._processSubmission({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        store,
        customer,
        outlet,
        submittedBy: "customer",
        processedBy: null,
        extractedOverrides,
      });

      console.log(`✅ [Receipt Submit] Done`);
      console.log(`   Submission: ${submission._id}`);
      console.log(`   Status    : ${submission.status}`);
      console.log(`   Points    : ${submission.pointsAwarded || 0}`);
      console.log(`   Fraud     : score=${submission.fraudScore}, flags=${submission.fraudFlags?.length || 0}`);
      console.log(`──────────────────────────────────────────────────────────\n`);

      const statusMessages = {
        pending: "Receipt submitted. Points will be awarded after review.",
        rejected: "Receipt could not be accepted. It may have already been submitted.",
        auto_approved: `Receipt processed! ${submission.pointsAwarded || 0} points awarded.`,
        flagged: `Receipt received. ${submission.pointsAwarded || 0} points awarded, pending final review.`,
      };

      const message = statusMessages[submission.status] || "Receipt submitted.";
      return responseHandler.created(
        res,
        {
          submissionId: submission._id,
          status: submission.status,
          pointsAwarded: submission.pointsAwarded || null,
        },
        message
      );
    } catch (error) {
      console.error("❌ submitReceipt error:", error);
      return responseHandler.serverError(res, "Failed to process receipt");
    }
  };

  // ─── POST /api/receipts/submit/staff ────────────────────────────────────────
  // Auth: storeMiddleware
  submitReceiptStaff = async (req, res) => {
    try {
      const store = req.store;

      if (!store?.receiptScan?.enabled) {
        return responseHandler.error(res, "Receipt scanning is not enabled for this store");
      }
      if (!req.file) {
        return responseHandler.error(res, "Receipt image is required");
      }

      const { customerId, outletId, totalAmount: confirmedAmount, receiptNumber: confirmedReceiptNumber } = req.body;
      if (!customerId) {
        return responseHandler.error(res, "Customer ID is required");
      }

      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return responseHandler.notFound(res, "Customer not found");
      }

      let outlet = null;
      if (outletId) {
        outlet = await outletModel.findById(outletId);
      }

      const providerOverride = req.query.provider || null;
      // Accept staff-confirmed fields as overrides
      const extractedOverrides = {};
      if (confirmedAmount) extractedOverrides.totalAmount = confirmedAmount;
      if (confirmedReceiptNumber) extractedOverrides.receiptNumber = confirmedReceiptNumber.trim();

      const submission = await this._processSubmission({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        store,
        customer,
        outlet,
        submittedBy: "staff",
        processedBy: store._id,
        providerOverride,
        extractedOverrides,
      });

      return responseHandler.created(
        res,
        {
          submissionId: submission._id,
          status: submission.status,
          pointsAwarded: submission.pointsAwarded || null,
          fraudScore: submission.fraudScore,
        },
        "Receipt submitted by staff"
      );
    } catch (error) {
      console.error("❌ submitReceiptStaff error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── GET /api/receipts/pending ──────────────────────────────────────────────
  // Auth: storeMiddleware — admin review queue
  listSubmissions = async (req, res) => {
    try {
      const store = req.store;
      const { page = 1, limit = 20, status = "pending" } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [submissions, total] = await Promise.all([
        receiptSubmissionModel
          .find({ store: store._id, status })
          .populate("customer", "name email phone")
          .populate("outlet", "location")
          .select("-extractedData.rawText") // omit large field from list view
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        receiptSubmissionModel.countDocuments({ store: store._id, status }),
      ]);

      // Generate signed image URLs
      for (const sub of submissions) {
        if (sub.imageKey) {
          sub.imageUrl = await this._getSignedImageUrl(sub.imageKey);
        }
      }

      return responseHandler.paginated(res, submissions, page, limit, total);
    } catch (error) {
      console.error("❌ listSubmissions error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── POST /api/receipts/:submissionId/approve ───────────────────────────────
  // Auth: storeMiddleware
  approveSubmission = async (req, res) => {
    try {
      const { submissionId } = req.params;
      const store = req.store;
      const { pointsOverride, notes } = req.body;

      const submission = await receiptSubmissionModel.findOne({
        _id: submissionId,
        store: store._id,
      });
      if (!submission) return responseHandler.notFound(res, "Submission not found");

      if (!["pending", "flagged"].includes(submission.status)) {
        return responseHandler.error(
          res,
          `Cannot approve a submission with status "${submission.status}"`
        );
      }

      const customer = await customerModel.findById(submission.customer);
      if (!customer) return responseHandler.notFound(res, "Customer not found");

      const outlet = submission.outlet
        ? await outletModel.findById(submission.outlet)
        : null;

      let points;
      if (pointsOverride != null) {
        points = Number(pointsOverride);
      } else if (!submission.calculatedPoints || submission.calculatedPoints <= 0) {
        // calculatedPoints was 0 (e.g. conversionRate was not set at submission time) —
        // try recalculating now using the store's current configuration
        const scanConfig = store.receiptScan || {};
        const pointsMode = scanConfig.pointsMode || "total_based";
        const { points: recalculated } = await calculateReceiptPoints({
          store,
          extractedData: submission.extractedData || {},
          pointsMode,
        });
        points = recalculated;
        if (points > 0) {
          submission.calculatedPoints = points;
          console.log(`✅ [approveSubmission] Recalculated points for submission ${submissionId}: ${points}`);
        }
      } else {
        points = submission.calculatedPoints;
      }

      submission.status = "approved";
      submission.reviewedBy = store._id;
      submission.reviewedAt = new Date();
      submission.reviewNotes = notes || "";
      await submission.save();

      await this._awardPoints({ submission, store, customer, outlet, points });

      // Update L6 mission progress based on purchased items (non-fatal)
      if (store.loyaltyCard?.format === "L6") {
        await updateMissionProgress({
          store,
          customer,
          items: submission.extractedData?.items || [],
          receiptDate: submission.extractedData?.receiptDate,
          submissionCreatedAt: submission.createdAt,
        });
      }

      // Approval notification
      try {
        await notificationController.singleNotification({
          title: "Receipt Approved",
          body: `Your receipt was approved. ${points} points have been added to your account.`,
          userId: customer._id,
          points,
          storeName: store.name,
          storeURL: store.url,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          storeId: store._id,
        });
      } catch (_) {}

      return responseHandler.success(
        res,
        { pointsAwarded: points },
        "Receipt approved and points awarded"
      );
    } catch (error) {
      console.error("❌ approveSubmission error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── POST /api/receipts/:submissionId/reject ────────────────────────────────
  // Auth: storeMiddleware
  rejectSubmission = async (req, res) => {
    try {
      const { submissionId } = req.params;
      const store = req.store;
      const { reason, notes } = req.body;

      const submission = await receiptSubmissionModel.findOne({
        _id: submissionId,
        store: store._id,
      });
      if (!submission) return responseHandler.notFound(res, "Submission not found");

      if (!["pending", "flagged"].includes(submission.status)) {
        return responseHandler.error(
          res,
          `Cannot reject a submission with status "${submission.status}"`
        );
      }

      submission.status = "rejected";
      submission.rejectionReason = reason || "Rejected by store";
      submission.reviewNotes = notes || "";
      submission.reviewedBy = store._id;
      submission.reviewedAt = new Date();
      await submission.save();

      // Rejection notification (non-fatal)
      try {
        const customer = await customerModel.findById(submission.customer);
        if (customer) {
          await notificationController.singleNotification({
            title: "Receipt Not Approved",
            body: `Your receipt submission could not be approved. Reason: ${reason || "Please contact the store."}`,
            userId: customer._id,
            storeName: store.name,
            storeURL: store.url,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            storeId: store._id,
          });
        }
      } catch (_) {}

      return responseHandler.success(res, null, "Submission rejected");
    } catch (error) {
      console.error("❌ rejectSubmission error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── POST /api/receipts/:submissionId/reverse ───────────────────────────────
  // Auth: storeMiddleware — claws back points from an approved/auto_approved submission
  reverseSubmission = async (req, res) => {
    try {
      const { submissionId } = req.params;
      const store = req.store;

      const submission = await receiptSubmissionModel.findOne({
        _id: submissionId,
        store: store._id,
      });
      if (!submission) return responseHandler.notFound(res, "Submission not found");

      if (!["approved", "auto_approved", "flagged"].includes(submission.status)) {
        return responseHandler.error(
          res,
          "Only approved or flagged submissions can be reversed"
        );
      }

      const points = submission.pointsAwarded || 0;
      const isL5 = store.loyaltyCard?.format === "L5";

      if (points > 0) {
        if (isL5 && submission.outlet) {
          await customerOutletPointsModel.findOneAndUpdate(
            {
              customer: submission.customer,
              store: store._id,
              outlet: submission.outlet,
            },
            { $inc: { currentPoints: -points } }
          );

          await l5PointsTransactionModel.create({
            store: store._id,
            customer: submission.customer,
            outlet: submission.outlet,
            transactionType: "adjustment",
            points: -points,
            balanceAfter: 0, // client will recalculate from fresh query
            description: `Reversal of receipt scan #${submission._id}`,
            isManual: true,
            processedBy: store._id,
          });
        }

        const customerInc = { points: -points };
        if (!isL5) customerInc.totalPoints = -points;
        await customerModel.findByIdAndUpdate(submission.customer, {
          $inc: customerInc,
          pointChangeDate: new Date(),
        });
      }

      const { cancellationNotes } = req.body;
      if (cancellationNotes) submission.reviewNotes = cancellationNotes;
      submission.status = "reversed";
      submission.reversedAt = new Date();
      submission.reversedBy = store._id;
      await submission.save();

      console.log(`✅ Reversed ${points} points for submission ${submission._id}`);
      return responseHandler.success(
        res,
        null,
        `Reversed: ${points} points clawed back from customer`
      );
    } catch (error) {
      console.error("❌ reverseSubmission error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── GET /api/receipts/customer/history ─────────────────────────────────────
  // Auth: customerMiddleware
  getCustomerHistory = async (req, res) => {
    try {
      const customer = req.user;
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [submissions, total] = await Promise.all([
        receiptSubmissionModel
          .find({ customer: customer._id, store: customer.store })
          .select("-extractedData.rawText -receiptHash") // omit large/sensitive fields
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        receiptSubmissionModel.countDocuments({
          customer: customer._id,
          store: customer.store,
        }),
      ]);

      // Generate signed image URLs
      for (const sub of submissions) {
        if (sub.imageKey) {
          sub.imageUrl = await this._getSignedImageUrl(sub.imageKey);
        }
      }

      return responseHandler.paginated(res, submissions, page, limit, total);
    } catch (error) {
      console.error("❌ getCustomerHistory error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── GET /api/receipts/:submissionId ───────────────────────────────────────
  // Auth: storeMiddleware — full detail for admin review modal
  getSubmissionDetail = async (req, res) => {
    try {
      const { submissionId } = req.params;
      const store = req.store;

      const submission = await receiptSubmissionModel
        .findOne({ _id: submissionId, store: store._id })
        .populate("customer", "name email phone")
        .populate("outlet", "location")
        .lean();

      if (!submission) return responseHandler.notFound(res, "Submission not found");

      if (submission.imageKey) {
        submission.imageUrl = await this._getSignedImageUrl(submission.imageKey);
      }

      return responseHandler.success(res, submission);
    } catch (error) {
      console.error("❌ getSubmissionDetail error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── PUT /api/receipts/scan-config ──────────────────────────────────────────
  // Auth: storeMiddleware — store-assigned user updates auto-approval thresholds
  updateScanConfig = async (req, res) => {
    try {
      const store = req.store;
      const { autoApproveMaxFraudScore, autoApproveMinConfidence } = req.body;
      const update = {};

      if (autoApproveMaxFraudScore !== undefined) {
        const v = Number(autoApproveMaxFraudScore);
        if (isNaN(v) || v < 0 || v > 100) {
          return responseHandler.error(res, "autoApproveMaxFraudScore must be between 0 and 100");
        }
        update["receiptScan.autoApproveMaxFraudScore"] = v;
      }
      if (autoApproveMinConfidence !== undefined) {
        const v = Number(autoApproveMinConfidence);
        if (isNaN(v) || v < 0 || v > 1) {
          return responseHandler.error(res, "autoApproveMinConfidence must be between 0 and 1");
        }
        update["receiptScan.autoApproveMinConfidence"] = v;
      }

      if (Object.keys(update).length === 0) {
        return responseHandler.error(res, "No valid fields provided");
      }

      const updated = await storeModel.findByIdAndUpdate(
        store._id,
        { $set: update },
        { new: true }
      );
      console.log(`✅ [updateScanConfig] Store ${store._id} scan config updated`);
      return responseHandler.success(res, updated.receiptScan, "Scan config updated");
    } catch (error) {
      console.error("❌ updateScanConfig error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── GET /api/receipts/portal/stores ────────────────────────────────────────
  // Auth: authMiddleware — admin gets all stores; user gets their assigned stores
  listPortalStores = async (req, res) => {
    try {
      const user = req.user;
      let stores;
      // Include fields needed for point calculation in ReceiptDetailModal
      const fields = "name _id receiptScan loyaltyCard pointEarnRate conversionRate amount isRounded";
      if (user.role === "admin") {
        stores = await storeModel.find({}, fields).lean();
      } else {
        stores = await storeModel.find({ user: user._id }, fields).lean();
      }
      return responseHandler.success(res, stores);
    } catch (error) {
      console.error("❌ listPortalStores error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── GET /api/receipts/portal/submissions ───────────────────────────────────
  // Auth: authMiddleware — admin queries any store; user gets their assigned store
  listPortalSubmissions = async (req, res) => {
    try {
      const user = req.user;
      const { storeId, status = "pending", page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let queryStoreId;
      if (user.role === "admin") {
        if (!storeId) return responseHandler.error(res, "storeId query param is required");
        queryStoreId = storeId;
      } else {
        const store = await storeModel.findOne({ user: user._id }).lean();
        if (!store) return responseHandler.error(res, "No store assigned to this account");
        queryStoreId = store._id;
      }

      const [submissions, total] = await Promise.all([
        receiptSubmissionModel
          .find({ store: queryStoreId, status })
          .populate("customer", "name email phone")
          .populate("outlet", "location")
          .select("-extractedData.rawText")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        receiptSubmissionModel.countDocuments({ store: queryStoreId, status }),
      ]);

      for (const sub of submissions) {
        if (sub.imageKey) sub.imageUrl = await this._getSignedImageUrl(sub.imageKey);
      }

      return responseHandler.paginated(res, submissions, page, limit, total);
    } catch (error) {
      console.error("❌ listPortalSubmissions error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── Internal: verify portal user has access to a submission's store ────────
  _verifyPortalAccess = async (user, submission) => {
    const store = await storeModel.findById(submission.store);
    if (!store) return null;
    if (user.role === "admin") return store;
    const isAssigned = store.user.map(String).includes(user._id.toString());
    return isAssigned ? store : null;
  };

  // ─── POST /api/receipts/portal/:submissionId/approve ────────────────────────
  // Auth: authMiddleware
  approvePortalSubmission = async (req, res) => {
    try {
      const { submissionId } = req.params;
      const user = req.user;
      const { pointsOverride, notes } = req.body;

      const submission = await receiptSubmissionModel.findById(submissionId);
      if (!submission) return responseHandler.notFound(res, "Submission not found");

      const store = await this._verifyPortalAccess(user, submission);
      if (!store) return responseHandler.unauthorized(res, "Access denied");

      if (!["pending", "flagged"].includes(submission.status)) {
        return responseHandler.error(res, `Cannot approve a submission with status "${submission.status}"`);
      }

      const customer = await customerModel.findById(submission.customer);
      if (!customer) return responseHandler.notFound(res, "Customer not found");

      const outlet = submission.outlet ? await outletModel.findById(submission.outlet) : null;

      let points;
      if (pointsOverride != null) {
        points = Number(pointsOverride);
      } else if (!submission.calculatedPoints || submission.calculatedPoints <= 0) {
        const scanConfig = store.receiptScan || {};
        const pointsMode = scanConfig.pointsMode || "total_based";
        const { points: recalculated } = await calculateReceiptPoints({
          store,
          extractedData: submission.extractedData || {},
          pointsMode,
        });
        points = recalculated;
        if (points > 0) submission.calculatedPoints = points;
      } else {
        points = submission.calculatedPoints;
      }

      submission.status = "approved";
      submission.reviewedBy = user._id;
      submission.reviewedAt = new Date();
      submission.reviewNotes = notes || "";
      await submission.save();

      await this._awardPoints({ submission, store, customer, outlet, points });

      try {
        await notificationController.singleNotification({
          title: "Receipt Approved",
          body: `Your receipt was approved. ${points} points have been added to your account.`,
          userId: customer._id,
          points,
          storeName: store.name,
          storeURL: store.url,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          storeId: store._id,
        });
      } catch (_) {}

      return responseHandler.success(res, { pointsAwarded: points }, "Receipt approved and points awarded");
    } catch (error) {
      console.error("❌ approvePortalSubmission error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── POST /api/receipts/portal/:submissionId/reject ─────────────────────────
  // Auth: authMiddleware
  rejectPortalSubmission = async (req, res) => {
    try {
      const { submissionId } = req.params;
      const user = req.user;
      const { reason, notes } = req.body;

      const submission = await receiptSubmissionModel.findById(submissionId);
      if (!submission) return responseHandler.notFound(res, "Submission not found");

      const store = await this._verifyPortalAccess(user, submission);
      if (!store) return responseHandler.unauthorized(res, "Access denied");

      if (!["pending", "flagged"].includes(submission.status)) {
        return responseHandler.error(res, `Cannot reject a submission with status "${submission.status}"`);
      }

      submission.status = "rejected";
      submission.rejectionReason = reason || "Rejected by reviewer";
      submission.reviewNotes = notes || "";
      submission.reviewedBy = user._id;
      submission.reviewedAt = new Date();
      await submission.save();

      try {
        const customer = await customerModel.findById(submission.customer);
        if (customer) {
          await notificationController.singleNotification({
            title: "Receipt Not Approved",
            body: `Your receipt submission could not be approved. Reason: ${reason || "Please contact the store."}`,
            userId: customer._id,
            storeName: store.name,
            storeURL: store.url,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            storeId: store._id,
          });
        }
      } catch (_) {}

      return responseHandler.success(res, null, "Submission rejected");
    } catch (error) {
      console.error("❌ rejectPortalSubmission error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── POST /api/receipts/portal/:submissionId/reverse ────────────────────────
  // Auth: authMiddleware
  reversePortalSubmission = async (req, res) => {
    try {
      const { submissionId } = req.params;
      const user = req.user;

      const submission = await receiptSubmissionModel.findById(submissionId);
      if (!submission) return responseHandler.notFound(res, "Submission not found");

      const store = await this._verifyPortalAccess(user, submission);
      if (!store) return responseHandler.unauthorized(res, "Access denied");

      if (!["approved", "auto_approved", "flagged"].includes(submission.status)) {
        return responseHandler.error(res, "Only approved or flagged submissions can be reversed");
      }

      const points = submission.pointsAwarded || 0;
      const isL5 = store.loyaltyCard?.format === "L5";

      if (points > 0) {
        if (isL5 && submission.outlet) {
          await customerOutletPointsModel.findOneAndUpdate(
            { customer: submission.customer, store: store._id, outlet: submission.outlet },
            { $inc: { currentPoints: -points } }
          );
          await l5PointsTransactionModel.create({
            store: store._id,
            customer: submission.customer,
            outlet: submission.outlet,
            transactionType: "adjustment",
            points: -points,
            balanceAfter: 0,
            description: `Reversal of receipt scan #${submission._id}`,
            isManual: true,
            processedBy: user._id,
          });
        }
        const portalCustomerInc = { points: -points };
        if (!isL5) portalCustomerInc.totalPoints = -points;
        await customerModel.findByIdAndUpdate(submission.customer, {
          $inc: portalCustomerInc,
          pointChangeDate: new Date(),
        });
      }

      const { cancellationNotes } = req.body;
      if (cancellationNotes) submission.reviewNotes = cancellationNotes;
      submission.status = "reversed";
      submission.reversedAt = new Date();
      submission.reversedBy = user._id;
      await submission.save();

      console.log(`✅ Portal reversed ${points} points for submission ${submission._id}`);
      return responseHandler.success(res, null, `Reversed: ${points} points clawed back from customer`);
    } catch (error) {
      console.error("❌ reversePortalSubmission error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── PUT /api/receipts/portal/scan-config/:storeId ──────────────────────────
  // Auth: authMiddleware — admin/user updates scan config for a store
  updatePortalScanConfig = async (req, res) => {
    try {
      const user = req.user;
      const { storeId } = req.params;
      const { autoApproveMaxFraudScore, autoApproveMinConfidence } = req.body;

      const store = await storeModel.findById(storeId);
      if (!store) return responseHandler.notFound(res, "Store not found");

      // Check access: admin can update any store; regular user must be assigned
      if (user.role !== "admin") {
        const isAssigned = store.user.map(String).includes(user._id.toString());
        if (!isAssigned) return responseHandler.unauthorized(res, "Access denied");
      }

      const update = {};
      if (autoApproveMaxFraudScore !== undefined) {
        const v = Number(autoApproveMaxFraudScore);
        if (isNaN(v) || v < 0 || v > 100) {
          return responseHandler.error(res, "autoApproveMaxFraudScore must be between 0 and 100");
        }
        update["receiptScan.autoApproveMaxFraudScore"] = v;
      }
      if (autoApproveMinConfidence !== undefined) {
        const v = Number(autoApproveMinConfidence);
        if (isNaN(v) || v < 0 || v > 1) {
          return responseHandler.error(res, "autoApproveMinConfidence must be between 0 and 1");
        }
        update["receiptScan.autoApproveMinConfidence"] = v;
      }

      if (Object.keys(update).length === 0) {
        return responseHandler.error(res, "No valid fields provided");
      }

      const updated = await storeModel.findByIdAndUpdate(
        storeId,
        { $set: update },
        { new: true }
      );
      console.log(`✅ [updatePortalScanConfig] Store ${storeId} scan config updated by user ${user._id}`);
      return responseHandler.success(res, updated.receiptScan, "Scan config updated");
    } catch (error) {
      console.error("❌ updatePortalScanConfig error:", error);
      return responseHandler.serverError(res);
    }
  };

  // ─── GET /api/receipts/portal/item-analytics ────────────────────────────────
  // Auth: authMiddleware — aggregates OCR-extracted line items for a store
  // Query: storeId (required for admin), dateRange (7d|30d|3m|all, default: 30d)
  getItemAnalytics = async (req, res) => {
    try {
      const user = req.user;
      const { storeId, dateRange = "30d" } = req.query;

      let queryStoreId;
      if (user.role === "admin") {
        if (!storeId) return responseHandler.error(res, "storeId query param is required");
        queryStoreId = storeId;
      } else {
        const store = await storeModel.findOne({ user: user._id }).lean();
        if (!store) return responseHandler.error(res, "No store assigned to this account");
        queryStoreId = store._id;
      }

      const dateFilter = {};
      const now = new Date();
      if (dateRange === "7d") dateFilter.createdAt = { $gte: new Date(now - 7 * 86400000) };
      else if (dateRange === "30d") dateFilter.createdAt = { $gte: new Date(now - 30 * 86400000) };
      else if (dateRange === "3m") dateFilter.createdAt = { $gte: new Date(now - 90 * 86400000) };

      const pipeline = [
        {
          $match: {
            store: new mongoose.Types.ObjectId(queryStoreId),
            status: { $in: ["approved", "auto_approved", "flagged"] },
            ...dateFilter,
          },
        },
        { $unwind: { path: "$extractedData.items", preserveNullAndEmptyArrays: false } },
        { $match: { "extractedData.items.name": { $exists: true, $ne: "" } } },
        // Level 1: group by {itemName, customerId} to get per-customer-per-item stats
        {
          $group: {
            _id: {
              item: { $toLower: { $trim: { input: "$extractedData.items.name" } } },
              customer: "$customer",
            },
            customerQty: { $sum: { $ifNull: ["$extractedData.items.quantity", 1] } },
            customerOrders: { $sum: 1 },
            customerRevenue: {
              $sum: {
                $multiply: [
                  { $ifNull: ["$extractedData.items.quantity", 1] },
                  { $ifNull: ["$extractedData.items.price", 0] },
                ],
              },
            },
          },
        },
        // Level 2: group by itemName — aggregate totals and collect customer stats
        {
          $group: {
            _id: "$_id.item",
            totalQuantity: { $sum: "$customerQty" },
            totalRevenue: { $sum: "$customerRevenue" },
            receiptCount: { $sum: "$customerOrders" },
            customerStats: {
              $push: {
                customerId: "$_id.customer",
                orderCount: "$customerOrders",
                totalQty: "$customerQty",
              },
            },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 50 },
        {
          $project: {
            _id: 0,
            name: "$_id",
            totalQuantity: 1,
            totalRevenue: { $round: ["$totalRevenue", 2] },
            receiptCount: 1,
            customerStats: 1,
          },
        },
      ];

      // Diagnostic counts
      const [totalEligible, withItems] = await Promise.all([
        receiptSubmissionModel.countDocuments({
          store: new mongoose.Types.ObjectId(queryStoreId),
          status: { $in: ["approved", "auto_approved", "flagged"] },
          ...dateFilter,
        }),
        receiptSubmissionModel.countDocuments({
          store: new mongoose.Types.ObjectId(queryStoreId),
          status: { $in: ["approved", "auto_approved", "flagged"] },
          "extractedData.items.0": { $exists: true },
          ...dateFilter,
        }),
      ]);
      console.log(`📊 [getItemAnalytics] Store=${queryStoreId} range=${dateRange}`);
      console.log(`   Eligible receipts (approved/auto_approved/flagged): ${totalEligible}`);
      console.log(`   Of those with at least 1 item extracted: ${withItems}`);

      const rawItems = await receiptSubmissionModel.aggregate(pipeline);
      console.log(`   Aggregated unique item names returned: ${rawItems.length}`);

      // Enrich with customer details (one query for all customers across all items)
      const allCustomerIds = [
        ...new Set(
          rawItems.flatMap((item) => item.customerStats.map((c) => c.customerId.toString()))
        ),
      ];
      const customerDocs = allCustomerIds.length
        ? await customerModel.find({ _id: { $in: allCustomerIds } }, "name phone email").lean()
        : [];
      const customerMap = Object.fromEntries(customerDocs.map((c) => [c._id.toString(), c]));

      const items = rawItems.map((item) => ({
        name: item.name,
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue,
        receiptCount: item.receiptCount,
        customers: item.customerStats
          .map((cs) => ({
            customerId: cs.customerId,
            orderCount: cs.orderCount,
            totalQty: cs.totalQty,
            name: customerMap[cs.customerId.toString()]?.name || null,
            phone: customerMap[cs.customerId.toString()]?.phone || null,
          }))
          .sort((a, b) => b.orderCount - a.orderCount),
      }));

      if (items.length > 0) {
        console.log(`   Top 5 items: ${items.slice(0, 5).map((i) => `"${i.name}" (qty=${i.totalQuantity}, customers=${i.customers.length})`).join(", ")}`);
      }
      return responseHandler.success(res, { items, dateRange });
    } catch (error) {
      console.error("❌ getItemAnalytics error:", error);
      return responseHandler.serverError(res);
    }
  };
}

module.exports = new ReceiptController();
