// changing test
const generateToken = require("../config/generateToken");
const customerModel = require("../models/customerModel");
const pointsModel = require("../models/pointsModel");
const storeModel = require("../models/storeModel");
const mailController = require("./mailController");
const smsController = require("./smsController");
const validator = require("validator");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const rewardModel = require("../models/rewardModel");
const redemptionModel = require("../models/redemptionModel");
const reservationModel = require("../models/reservationModel");
const mailSMSModel = require("../models/mailSMSModel");
const s3 = require("../config/s3Config.js");
const pointsHistoryModel = require("../models/pointsHistoryModel.js");
const notificationModel = require("../models/notificationModel.js");
const Subscription = require("../models/Subscription.js");
const { getDistance } = require("geolib");
const webpush = require("web-push");
const userTier = require("../config/userTier.js");
const NotificationLog = require("../models/NotificationLog.js");
const outletPointsModel = require("../models/outletPointsModel.js");
const printPointsModel = require("../models/printPointsModel.js");
const upgradeTier = require("../config/upgradeTier.js");
const notificationController = require("./notificationController.js");
const reservationSettingModel = require("../models/reservationSettingModel.js");
const { updateVisitAnalytics } = require("../services/visitAnalyticsService.js");
const axios = require("axios");

// const smsController = new SmsController();
// const mailController = new MailController();

class CustomerController {
  //Customer Register
  register = async (req, res) => {
    try {
      let { name, email, phone, gender, dob, termsAccepted } = req.body;
      const { storeURL } = req.params;
      const store = await storeModel.findOne({ url: storeURL });

      // Email-only step-based lookup (non-OTP stores: step 1 checks if user exists by email)
      if (email && !name && !phone) {
        if (!store) return res.status(404).json({ success: false, message: "Store not found" });
        const existing = await customerModel.findOne({
          store: store._id,
          email,
          name: { $ne: "Pending Verification" },
        });
        if (existing) {
          return res.json({
            success: true,
            message: "Login Successful",
            customer: existing,
            token: generateToken(existing._id, "365 days"),
            isNew: false,
          });
        }
        return res.json({
          success: false,
          needsProfile: true,
          message: "Please complete your profile to continue",
        });
      }

      if (!email || !name) {
        return res.json({ success: false, message: "All fields are required" });
      }
      if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Invalid email address" });
      }
      if (phone && !validator.isMobilePhone(phone)) {
        return res.json({ success: false, message: "Invalid Phone Number" });
      }
      // Phone is optional for email-based profile flow; generate a unique placeholder if absent
      if (!phone) {
        phone = -(Date.now() % 900000000 + Math.floor(Math.random() * 1000));
      }

      // Check if a customer already exists in the specific store
      const existingCustomer = await customerModel.findOne({
        store,
        $or: [{ phone }, { email }],
      });

      if (existingCustomer) {
        const checkExistingCustomer = await customerModel.findOne({
          store,
          phone,
          email,
        });
        if (!checkExistingCustomer) {
          return res.json({
            success: false,
            message: "Invalid Email ID or Phone Number",
          });
        }
        if (dob) checkExistingCustomer.dob = dob;
        if (gender) checkExistingCustomer.gender = gender;
        if (termsAccepted && !checkExistingCustomer.termsAccepted) {
          checkExistingCustomer.termsAccepted = true;
          checkExistingCustomer.termsAcceptedAt = new Date();
        }
        await checkExistingCustomer.save();
        const token = generateToken(existingCustomer._id, "365 days");
        return res.json({
          success: true,
          message: "Login Successful",
          customer: checkExistingCustomer,
          token,
          isNew: false,
        });
      }
      const tier = store?.loyaltyCard?.tier?.[0]?.name || "Bronze Tier";

      // Create a new customer if not already exists
      const customer = await customerModel.create({
        ...req.body,
        phone,
        tier,
        store,
        termsAccepted: !!termsAccepted,
        termsAcceptedAt: termsAccepted ? new Date() : undefined,
      });

      if (customer) {
        let updatedCustomer = customer;
        if (store?.givePointsOnRegister) {
          updatedCustomer = await this.getOnePoint(customer._id, storeURL);
        }
        return res.json({
          success: true,
          message: "Registration Successful.",
          customer: updatedCustomer,
          token: generateToken(customer._id, "365 days"),
          isNew: true,
        });
      } else {
        return res.json({
          success: false,
          message: "Registration Failed",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  };

  //CUSTOMER GET LOYALTY CARD DATA
  async getLoyaltyCardData(req, res) {
    try {
      const { storeURL } = req.params;
      const store = await storeModel.findOne({ url: storeURL });
      if (!store) {
        return res
          .status(404)
          .json({ success: false, message: "Store not found" });
      }
      const getObjectParams = {
        Bucket: "samparka",
        Key: store.logo,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      store.logo = url;

      if (store.loyaltyCard.customStamp) {
        const getObjectParams1 = {
          Bucket: "samparka",
          Key: store.loyaltyCard.customStamp,
        };
        const command1 = new GetObjectCommand(getObjectParams1);
        const url1 = await getSignedUrl(s3, command1, { expiresIn: 3600 });
        store.loyaltyCard.customStamp = url1;
      } else {
        store.loyaltyCard.customStamp = null; // or set a default value
      }
      return res.json({ success: true, store });
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  }

  // GET CUSTOMER DATA
  async getCustomerData(req, res) {
    try {
      const customer = await customerModel
        .findById(req.user)
        .populate("store", "loyaltyCard");

      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      if (customer.store?.loyaltyCard?.format === "L3" || customer.store?.loyaltyCard?.format === "L6") {
        const newTier = userTier(
          customer.store.loyaltyCard.tier,
          customer.points
        );

        if (newTier && newTier !== customer.tier) {
          customer.tier = newTier;
          await customer.save();
        }
      }

      if (customer.store?.loyaltyCard?.format === "L4") {
        const upgradeTierL4 = require("../config/upgradeTierL4");
        const tiers = customer.store.loyaltyCard.tier || [];
        if (tiers.length > 0) {
          if (customer.tierLockedByAdmin) {
            // Admin manually set this tier — leave it completely untouched on read.
            // The unlock logic lives in editUserPoints (bill scan), where new points
            // are in hand and we can safely decide whether the customer has earned past it.
            // Checking here caused admin downgrades to be immediately reverted on page load.
          } else {
            const upgraded = upgradeTierL4(customer, tiers);
            if (upgraded.tier !== customer.tier) {
              customer.tier = upgraded.tier;
              customer.lastTierChecked = upgraded.lastTierChecked;
              await customer.save();
            }
          }
        }
      }

      const sanitizedCustomer = customer.toObject();
      delete sanitizedCustomer.store;

      // If the customer's last visit was before yesterday, their streak is broken — show 0
      if (sanitizedCustomer.visitStreak) {
        const todayStr = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        const lastVisitStr = customer.lastVisitDate
          ? customer.lastVisitDate.toISOString().split("T")[0]
          : null;
        if (lastVisitStr !== todayStr && lastVisitStr !== yesterdayStr) {
          sanitizedCustomer.visitStreak = 0;
        }
      }

      return res.send(sanitizedCustomer);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  // EDIT CUSTOMER DATA
  async edit(req, res) {
    try {
      const { name, email, phone, dob, countryCode } = req.body;

      // Find customer by logged in user id
      const customer = await customerModel.findById(req.user);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const storeId = customer.store; // current customer's store

      // ✅ Check email uniqueness in the same store
      if (email && email !== customer.email) {
        const emailExists = await customerModel.findOne({
          email,
          store: storeId,
          _id: { $ne: customer._id }, // exclude self
        });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: "Email already exists.",
          });
        }
        customer.email = email;
      }

      // ✅ Check phone uniqueness in the same store
      if (phone && phone !== customer.phone) {
        const phoneExists = await customerModel.findOne({
          phone,
          store: storeId,
          _id: { $ne: customer._id },
        });
        if (phoneExists) {
          return res.status(400).json({
            success: false,
            message: "Phone number already exists.",
          });
        }
        customer.phone = phone;
      }

      // ✅ Other profile updates
      if (name) customer.name = name;
      if (dob) customer.dob = dob;
      if (countryCode) customer.countryCode = countryCode;

      await customer.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: customer,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error,
      });
    }
  }

  //GET CUSTOMERS DATA
  async getCustomers(req, res) {
    try {
      const { storeID } = req.params;

      const customers = await customerModel
        .find({ store: storeID })
        .select("name points");

      return res.json({ success: true, customers });
    } catch (error) {
      console.error("Error fetching customers:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  }

  //CUSTOMER GET POINTS
  async getPoints(req, res) {
    try {
      if (!req.user) {
        return res.json({ success: false });
      }
      if (req.user.store.limitPoints) {
        const customerPointsHistory = await pointsHistoryModel
          .find({
            customer: req.user._id,
          })
          .sort({ createdAt: -1 }); // Get latest first

        // If there is at least one record
        if (customerPointsHistory.length > 0) {
          const latest = customerPointsHistory[0];
          const createdAtDate = new Date(latest.createdAt);
          const today = new Date();

          const isToday =
            createdAtDate.getDate() === today.getDate() &&
            createdAtDate.getMonth() === today.getMonth() &&
            createdAtDate.getFullYear() === today.getFullYear();

          if (isToday) {
            return res.json({
              success: false,
              message: "Points Limit Reached",
            });
          }
        }
      }

      const { pointsId } = req.params;
      if (pointsId) {
        // ATOMIC OPERATION: Find points with non-zero value AND set to 0 in single operation
        // This prevents race condition where multiple requests process same points
        const points = await pointsModel.findOneAndUpdate(
          { _id: pointsId, points: { $ne: 0 } },
          { $set: { points: 0 } },
          { new: false } // Return the ORIGINAL document with points value
        );

        if (points) {
          if (points.store._id.equals(req.user.store._id)) {
            // Points already claimed atomically above, proceed with processing
            if (points.points !== 0) {
              let receivedPoints = parseFloat(points.points.toFixed(1));
              // Double points check
              const storeDoc = req.user.store;
              if (storeDoc?.doublePoints && Array.isArray(storeDoc.doublePointsDays) && storeDoc.doublePointsDays.length > 0) {
                const tz = storeDoc.timezone || 'Asia/Kathmandu';
                const dayIndex = new Date(new Date().toLocaleString('en-US', { timeZone: tz })).getDay();
                if (storeDoc.doublePointsDays.includes(dayIndex)) {
                  receivedPoints = parseFloat((receivedPoints * 2).toFixed(1));
                  console.log(`✅ Double points applied: day=${dayIndex}, original=${points.points}, doubled=${receivedPoints}`);
                }
              }
              const currentCustomer = await customerModel.findById(req.user);
              const newPoints = parseFloat(
                (currentCustomer.points + receivedPoints).toFixed(1)
              );
              const totalPoints =
                currentCustomer.totalPoints < currentCustomer.points
                  ? newPoints
                  : parseFloat(
                      (currentCustomer.totalPoints + receivedPoints).toFixed(1)
                    );
              // Points adding to customerModel
              const customer = await customerModel
                .findByIdAndUpdate(
                  req.user,
                  { points: newPoints, totalPoints: totalPoints },
                  { new: true }
                )
                .populate("store");
              customer.points = Number(customer.points.toFixed(2));
              customer.pointChangeDate = new Date();

              // Streak calculation
              const streakToday = new Date();
              const streakTodayStr = streakToday.toISOString().split('T')[0];
              const streakLastStr = customer.lastVisitDate
                ? customer.lastVisitDate.toISOString().split('T')[0]
                : null;
              if (!streakLastStr) {
                customer.visitStreak = 1;
              } else if (streakLastStr === streakTodayStr) {
                // Already visited today — streak unchanged
              } else {
                const streakYesterday = new Date(streakToday);
                streakYesterday.setDate(streakYesterday.getDate() - 1);
                const streakYesterdayStr = streakYesterday.toISOString().split('T')[0];
                customer.visitStreak = streakLastStr === streakYesterdayStr
                  ? (customer.visitStreak || 0) + 1
                  : 1;
              }
              customer.lastVisitDate = streakToday;
              customer.longestStreak = Math.max(customer.longestStreak || 0, customer.visitStreak || 0);

              console.log("✅ Streak debug:", { visitStreak: customer.visitStreak, longestStreak: customer.longestStreak, lastVisitDate: customer.lastVisitDate, streakLastStr, streakTodayStr });

              customer.markModified("visitStreak");
              customer.markModified("longestStreak");
              customer.markModified("lastVisitDate");
              await customer.save();
              // Points history
              await pointsHistoryModel.create({
                points: points.points,
                billID: points.billID,
                customer: customer._id,
                store: customer.store._id,
              });

              // Update visit analytics
              try {
                await updateVisitAnalytics(customer._id, customer.store._id, null, points.points);
              } catch (analyticsError) {
                console.error('[getPoints] Analytics update failed:', analyticsError.message);
              }

              // Points already set to 0 atomically at the start - no need to update again

              const store = customer.store;
              if (store?.loyaltyCard?.format == "L34HA") {
                const updated = upgradeTier(customer, store.loyaltyCard.tier);
                customer.points = updated.points;
                customer.tier = updated.tier;
                customer.lastTierChecked = updated.lastTierChecked;

                await customer.save();
              }

              // Checking store Email and Pass to mail customer
              const getMessage = await mailSMSModel.findOne({ store });
              if (store.email && store.pass) {
                if (
                  getMessage &&
                  getMessage.mailAfterPointEarned &&
                  getMessage.mailAfterPointEarned.subject
                ) {
                  let subject = getMessage.mailAfterPointEarned.subject;
                  let message = getMessage.mailAfterPointEarned.message;
                  const mailResponse = await mailController.mailCustomers({
                    user: store.email,
                    pass: store.pass,
                    host: store.host,
                    port: store.port,
                    secure: store.secure,
                    email: customer.email,
                    subject,
                    message,
                    points: receivedPoints,
                    storeName: store.name,
                    storeURL: store.url,
                    storeLogo: store.logo,
                    cardColor: store.loyaltyCard?.cardColor,
                    textColor: store.loyaltyCard?.textColor,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                  });
                  console.log("Mail Response: ", mailResponse);
                }
              }

              // Checking store SMS Token to send SMS to customer
              if (store.smsToken) {
                // const getSMS = await mailSMSModel.findOne({ store });
                if (
                  getMessage &&
                  getMessage.smsAfterPointEarned &&
                  getMessage.smsAfterPointEarned.message
                ) {
                  let from = getMessage.smsAfterPointEarned.from;
                  let message = getMessage.smsAfterPointEarned.message;
                  const smsResponse = await smsController.smsCustomer({
                    token: store.smsToken,
                    to: customer.phone,
                    from,
                    message,
                    points: receivedPoints,
                    storeName: store.name,
                    storeURL: store.url,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                  });
                  console.log("smsResponse: ", smsResponse);
                }
              }

              // PUSH NOTIFICATION
              if (
                getMessage &&
                getMessage.notificationAfterPointEarned &&
                getMessage.notificationAfterPointEarned.body
              ) {
                let title = getMessage.notificationAfterPointEarned.title;
                let body = getMessage.notificationAfterPointEarned.body;
                const notificationResponse =
                  await notificationController.singleNotification({
                    title,
                    body,
                    userId: customer._id,
                    points: receivedPoints,
                    storeName: store.name,
                    storeURL: store.url,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                  });
                console.log("notification Response: ", notificationResponse);
                if (notificationResponse.success) {
                  const receivers = [
                    { customer: customer._id, read: false, readAt: null },
                  ];
                  // Create a notification document
                  const notification = new notificationModel({
                    store: store._id,
                    title: title || "Notification",
                    message: notificationResponse.formattedMessage || body || "New notification received.",
                    receivers,
                  });
                  await notification.save();
                }
              }

              return res.json({
                success: true,
                message: `Congratulation. You have received ${receivedPoints} points`,
                customer,
                points: receivedPoints,
              });
            } else {
              return res.json({ success: false, message: "No Points Found 4" });
            }
          } else {
            return res.json({ success: false, message: "No Points Found 3" });
          }
        } else {
          return res.json({ success: false, message: "No Points Found 2" });
        }
      } else {
        return res.json({ success: false, message: "No Points Found 1" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  //CUSTOMER GET POINTS FROM OUTLETS
  async getOutletPoints(req, res) {
    console.log('[getOutletPoints] FUNCTION CALLED - params:', req.params);
    console.log('[getOutletPoints] req.user:', req.user ? req.user._id : 'NO USER');
    try {
      if (!req.user) {
        console.log('[getOutletPoints] No req.user - returning false');
        return res.json({ success: false });
      }
      console.log('[getOutletPoints] User store:', req.user.store?._id || req.user.store);
      console.log('[getOutletPoints] limitPoints:', req.user.store?.limitPoints);
      if (req.user.store.limitPoints) {
        const customerPointsHistory = await pointsHistoryModel
          .find({
            customer: req.user._id,
          })
          .sort({ createdAt: -1 }); // Get latest first

        // If there is at least one record
        if (customerPointsHistory.length > 0) {
          const latest = customerPointsHistory[0];
          const createdAtDate = new Date(latest.createdAt);
          const today = new Date();

          const isToday =
            createdAtDate.getDate() === today.getDate() &&
            createdAtDate.getMonth() === today.getMonth() &&
            createdAtDate.getFullYear() === today.getFullYear();

          if (isToday) {
            return res.json({
              success: false,
              message: "Points Limit Reached",
            });
          }
        }
      }
      const { storeId, outletId } = req.params;
      if (storeId && outletId) {
        // ATOMIC OPERATION: Find points with non-zero value AND set to 0 in single operation
        // This prevents race condition where multiple requests process same points
        const points = await outletPointsModel
          .findOneAndUpdate(
            { store: storeId, outlet: outletId, points: { $ne: 0 } },
            { $set: { points: 0 } },
            { new: false } // Return the ORIGINAL document with points value
          )
          .populate("outlet");
        if (points) {
          if (points.store._id.equals(req.user.store._id)) {
            // Points already claimed atomically above, proceed with processing
            if (points.points !== 0) {
              const receivedPoints = parseFloat(points.points.toFixed(1));
              const currentCustomer = await customerModel.findById(req.user);
              const newPoints = parseFloat(
                (currentCustomer.points + receivedPoints).toFixed(1)
              );
              const totalPoints =
                currentCustomer.totalPoints < currentCustomer.points
                  ? newPoints
                  : parseFloat(
                      (currentCustomer.totalPoints + receivedPoints).toFixed(1)
                    );
              // Points adding to customerModel
              const customer = await customerModel
                .findByIdAndUpdate(
                  req.user,
                  { points: newPoints, totalPoints: totalPoints },
                  { new: true }
                )
                .populate("store");
              customer.points = Number(customer.points.toFixed(2));
              customer.pointChangeDate = new Date();
              await customer.save();
              // Points history
              await pointsHistoryModel.create({
                points: points.points,
                billID: points.billID,
                customer: customer._id,
                store: customer.store._id,
                outlet: points.outlet.location,
              });
              console.log('[getOutletPoints] Points history created successfully');
        
              // Update visit analytics
              console.log('[getOutletPoints] About to call updateVisitAnalytics with:', {
                customerId: customer._id?.toString(),
                storeId: customer.store._id?.toString(),
                outlet: points.outlet.location,
                points: points.points
              });
              try {
                const analyticsResult = await updateVisitAnalytics(customer._id, customer.store._id, points.outlet.location, points.points);
                console.log('[getOutletPoints] Analytics update result:', analyticsResult ? 'SUCCESS' : 'NULL');
                if (analyticsResult) {
                  console.log('[getOutletPoints] Analytics saved with visitCount:', analyticsResult.visitCount);
                }
              } catch (analyticsError) {
                console.error('[getOutletPoints] Analytics update failed:', analyticsError.message);
                console.error('[getOutletPoints] Analytics error stack:', analyticsError.stack);
              }

              const store = customer.store;

              if (store?.loyaltyCard?.format == "L34HA") {
                const updated = upgradeTier(customer, store.loyaltyCard.tier);
                customer.points = updated.points;
                customer.tier = updated.tier;
                customer.lastTierChecked = updated.lastTierChecked;

                await customer.save();
              }

              const getMessage = await mailSMSModel.findOne({ store });
              if (store.email && store.pass) {
                if (
                  getMessage &&
                  getMessage.mailAfterPointEarned &&
                  getMessage.mailAfterPointEarned.subject
                ) {
                  let subject = getMessage.mailAfterPointEarned.subject;
                  let message = getMessage.mailAfterPointEarned.message;
                  const mailResponse = await mailController.mailCustomers({
                    user: store.email,
                    pass: store.pass,
                    host: store.host,
                    port: store.port,
                    secure: store.secure,
                    email: customer.email,
                    subject,
                    message,
                    points: receivedPoints,
                    storeName: store.name,
                    storeURL: store.url,
                    storeLogo: store.logo,
                    cardColor: store.loyaltyCard?.cardColor,
                    textColor: store.loyaltyCard?.textColor,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                  });
                  console.log(mailResponse);
                }
              }

              // Checking store SMS Token to send SMS to customer
              if (store.smsToken) {
                // const getSMS = await mailSMSModel.findOne({ store });
                if (
                  getMessage &&
                  getMessage.smsAfterPointEarned &&
                  getMessage.smsAfterPointEarned.message
                ) {
                  let from = getMessage.smsAfterPointEarned.from;
                  let message = getMessage.smsAfterPointEarned.message;
                  const smsResponse = await smsController.smsCustomer({
                    token: store.smsToken,
                    to: customer.phone,
                    from,
                    message,
                    points: receivedPoints,
                    storeName: store.name,
                    storeURL: store.url,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                  });
                  console.log(smsResponse);
                }
              }

              // PUSH NOTIFICATION
              // if (store._id == "6798b5994dfc04de9e55a3c1") {
              //   await fetch(
              //     // `https://server.samparka.co/send-notification/${customer._id}`,
              //     `${process.env.SERVER_ORIGIN}/send-notification/${customer._id}`,
              //     {
              //       method: "POST",
              //       headers: {
              //         "Content-Type": "application/json",
              //       },
              //       body: JSON.stringify({
              //         title: "Points Received",
              //         body: `Congratulations ${customer.name}. You have received ${receivedPoints} points`,
              //       }),
              //     }
              //   )
              //     .then(() => console.log("User notified!"))
              //     .catch((err) => console.log("Error sending notification"));
              // }
              if (
                getMessage &&
                getMessage.notificationAfterPointEarned &&
                getMessage.notificationAfterPointEarned.body
              ) {
                let title = getMessage.notificationAfterPointEarned.title;
                let body = getMessage.notificationAfterPointEarned.body;
                const notificationResponse =
                  await notificationController.singleNotification({
                    title,
                    body,
                    userId: customer._id,
                    points: receivedPoints,
                    storeName: store.name,
                    storeURL: store.url,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                  });
                console.log(notificationResponse);
                if (notificationResponse.success) {
                  const receivers = [
                    { customer: customer._id, read: false, readAt: null },
                  ];
                  // Create a notification document
                  const notification = new notificationModel({
                    store: store._id,
                    title: title || "Notification",
                    message: notificationResponse.formattedMessage || body || "New notification received.",
                    receivers,
                  });
                  await notification.save();
                }
              }

              return res.json({
                success: true,
                message: `Congratulation. You have received ${receivedPoints} points`,
                customer,
                points: receivedPoints,
              });
            } else {
              return res.json({ success: false, message: "No Points Found" });
            }
          } else {
            return res.json({ success: false, message: "No Points Found" });
          }
        } else {
          return res.json({ success: false, message: "No Points Found" });
        }
      } else {
        return res.json({ success: false, message: "No Points Found" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  //CUSTOMER GET POINTS FROM PRINTED QR
  async getPrintPoints(req, res) {
    try {
      if (!req.user) {
        return res.json({ success: false });
      }
      if (req.user.store.limitPoints) {
        const customerPointsHistory = await pointsHistoryModel
          .find({
            customer: req.user._id,
          })
          .sort({ createdAt: -1 }); // Get latest first

        // If there is at least one record
        if (customerPointsHistory.length > 0) {
          const latest = customerPointsHistory[0];
          const createdAtDate = new Date(latest.createdAt);
          const today = new Date();

          const isToday =
            createdAtDate.getDate() === today.getDate() &&
            createdAtDate.getMonth() === today.getMonth() &&
            createdAtDate.getFullYear() === today.getFullYear();

          if (isToday) {
            return res.json({
              success: false,
              message: "Points Limit Reached",
            });
          }
        }
      }
      const { pointsId } = req.params;
      if (pointsId) {
        // ATOMIC OPERATION: Find and DELETE points in single operation
        // This prevents race condition where multiple requests process same points
        const points = await printPointsModel
          .findOneAndDelete({ _id: pointsId, points: { $ne: 0 } })
          .populate("outlet");
        if (points) {
          if (points.store._id.equals(req.user.store._id)) {
            const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
            const createdTime = new Date(points.createdAt).getTime();
            const currentTime = Date.now();

            if (currentTime - createdTime > oneHour) {
              // Points expired - already deleted by findOneAndDelete above
              return res.json({ success: false, message: "No Points Found" });
            }

            // Points already claimed and deleted atomically above
            if (points.points !== 0) {
              let receivedPoints = parseFloat(points.points.toFixed(1));
              // Double points check
              const storeDoc = req.user.store;
              if (storeDoc?.doublePoints && Array.isArray(storeDoc.doublePointsDays) && storeDoc.doublePointsDays.length > 0) {
                const tz = storeDoc.timezone || 'Asia/Kathmandu';
                const dayIndex = new Date(new Date().toLocaleString('en-US', { timeZone: tz })).getDay();
                if (storeDoc.doublePointsDays.includes(dayIndex)) {
                  receivedPoints = parseFloat((receivedPoints * 2).toFixed(1));
                  console.log(`✅ Double points applied (print): day=${dayIndex}, original=${points.points}, doubled=${receivedPoints}`);
                }
              }
              const currentCustomer = await customerModel.findById(req.user);
              const newPoints = parseFloat(
                (currentCustomer.points + receivedPoints).toFixed(1)
              );
              const totalPoints =
                currentCustomer.totalPoints < currentCustomer.points
                  ? newPoints
                  : parseFloat(
                      (currentCustomer.totalPoints + receivedPoints).toFixed(1)
                    );
              // Points adding to customerModel
              const customer = await customerModel
                .findByIdAndUpdate(
                  req.user,
                  { points: newPoints, totalPoints: totalPoints },
                  { new: true }
                )
                .populate("store");
              customer.points = Number(customer.points.toFixed(2));
              customer.pointChangeDate = new Date();
              await customer.save();
              // Points history
              await pointsHistoryModel.create({
                points: points.points,
                billID: points?.billID,
                outlet: points?.outlet?.location,
                customer: customer._id,
                store: customer.store._id,
              });
          
              // Update visit analytics
              try {
                await updateVisitAnalytics(customer._id, customer.store._id, points?.outlet?.location, points.points);
              } catch (analyticsError) {
                console.error('[getPrintPoints] Analytics update failed:', analyticsError.message);
              }

              // Points already deleted atomically at the start - no need to delete again
              
              const store = customer.store;
              if (store?.loyaltyCard?.format == "L34HA") {
                const updated = upgradeTier(customer, store.loyaltyCard.tier);
                customer.points = updated.points;
                customer.tier = updated.tier;
                customer.lastTierChecked = updated.lastTierChecked;

                await customer.save();
              }

              const getMessage = await mailSMSModel.findOne({ store });
              if (store.email && store.pass) {
                if (
                  getMessage &&
                  getMessage.mailAfterPointEarned &&
                  getMessage.mailAfterPointEarned.subject
                ) {
                  let subject = getMessage.mailAfterPointEarned.subject;
                  let message = getMessage.mailAfterPointEarned.message;
                  const mailResponse = await mailController.mailCustomers({
                    user: store.email,
                    pass: store.pass,
                    host: store.host,
                    port: store.port,
                    secure: store.secure,
                    email: customer.email,
                    subject,
                    message,
                    points: receivedPoints,
                    storeName: store.name,
                    storeURL: store.url,
                    storeLogo: store.logo,
                    cardColor: store.loyaltyCard?.cardColor,
                    textColor: store.loyaltyCard?.textColor,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                  });
                  console.log(mailResponse);
                }
              }

              // Checking store SMS Token to send SMS to customer
              if (store.smsToken) {
                // const getSMS = await mailSMSModel.findOne({ store });
                if (
                  getMessage &&
                  getMessage.smsAfterPointEarned &&
                  getMessage.smsAfterPointEarned.message
                ) {
                  let from = getMessage.smsAfterPointEarned.from;
                  let message = getMessage.smsAfterPointEarned.message;
                  const smsResponse = await smsController.smsCustomer({
                    token: store.smsToken,
                    to: customer.phone,
                    from,
                    message,
                    points: receivedPoints,
                    storeName: store.name,
                    storeURL: store.url,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                  });
                  console.log(smsResponse);
                }
              }

              // PUSH NOTIFICATION
              // if (store._id == "6798b5994dfc04de9e55a3c1") {
              //   await fetch(
              //     // `https://server.samparka.co/send-notification/${customer._id}`,
              //     `${process.env.SERVER_ORIGIN}/send-notification/${customer._id}`,
              //     {
              //       method: "POST",
              //       headers: {
              //         "Content-Type": "application/json",
              //       },
              //       body: JSON.stringify({
              //         title: "Points Received",
              //         body: `Congratulations ${customer.name}. You have received ${receivedPoints} points`,
              //       }),
              //     }
              //   )
              //     .then(() => console.log("User notified!"))
              //     .catch((err) => console.log("Error sending notification"));
              // }
              if (
                getMessage &&
                getMessage.notificationAfterPointEarned &&
                getMessage.notificationAfterPointEarned.body
              ) {
                let title = getMessage.notificationAfterPointEarned.title;
                let body =
                  getMessage.notificationAfterPointEarned.body ||
                  `Congratulations ${customer.name}. You have received ${receivedPoints} points`;
                const notificationResponse =
                  await notificationController.singleNotification({
                    title,
                    body,
                    userId: customer._id,
                    points: receivedPoints,
                    storeName: store.name,
                    storeURL: store.url,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                  });
                console.log(notificationResponse);
                if (notificationResponse.success) {
                  const receivers = [
                    { customer: customer._id, read: false, readAt: null },
                  ];
                  // Create a notification document
                  const notification = new notificationModel({
                    store: store._id,
                    title: title || "Notification",
                    message: notificationResponse.formattedMessage || body || "New notification received.",
                    receivers,
                  });
                  await notification.save();
                }
              }

              return res.json({
                success: true,
                message: `Congratulation. You have received ${receivedPoints} points`,
                customer,
                points: receivedPoints,
              });
            } else {
              return res.json({ success: false, message: "No Points Found" });
            }
          } else {
            return res.json({ success: false, message: "No Points Found" });
          }
        } else {
          return res.json({ success: false, message: "No Points Found" });
        }
      } else {
        return res.json({ success: false, message: "No Points Found" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  getOnePoint = async (customerId, storeURL) => {
    try {
      // Checking customer
      const customer = await customerModel.findById(customerId).populate("store");
      if (!customer) {
        throw new Error("Customer not found");
      }

      const store = customer.store;
      
      // Check if store uses L5 format
      if (store?.loyaltyCard?.format === "L5") {
        console.log('[getOnePoint] L5 format detected - adding registration point without outlet tracking');
        
        // For L5 registration bonus: just add 1 point directly to customer.points
        // Don't create CustomerOutletPoints so it doesn't show in outlet breakdown
        await customerModel.findByIdAndUpdate(
          customerId,
          { $inc: { points: 1 }, pointChangeDate: new Date() },
          { new: true }
        );
        
        console.log('[getOnePoint] L5 customer points incremented by 1');
        
        // Points history for L5 registration (no billID, outlet, or remarks - will show as ---)
        const historyRecord = await pointsHistoryModel.create({
          points: 1,
          customer: customer._id,
          store: customer.store._id,
        });
        console.log('[getOnePoint] Points history created:', historyRecord._id);
        
        // Fetch updated customer for return
        const updatedCustomer = await customerModel
          .findById(customerId)
          .populate("store", "name email pass host port secure url smsToken logo loyaltyCard");
          
        // Update visit analytics - mark as signup to skip visit counting
        try {
          await updateVisitAnalytics(customer._id, store._id, null, 1, true);
        } catch (analyticsError) {
          console.error('[getOnePoint] Analytics update failed:', analyticsError.message);
        }
        
         // Continue to send email/SMS notifications (code below handles this)
        // Need to get store and getMessage for notifications
        const getMessage = await mailSMSModel.findOne({ store });
        console.log('[getOnePoint/L5] store.email:', store.email, '| store.host:', store.host, '| store.port:', store.port, '| store.secure:', store.secure);
        console.log('[getOnePoint/L5] getMessage exists:', !!getMessage, '| mailAfterLogin:', JSON.stringify(getMessage?.mailAfterLogin));
        if (store.email && store.pass) {
          if (
            getMessage &&
            getMessage.mailAfterLogin &&
            getMessage.mailAfterLogin.subject
          ) {
            let subject = getMessage.mailAfterLogin.subject;
            let message = getMessage.mailAfterLogin.message;
            const mailResponse = await mailController.mailCustomers({
              user: store.email,
              pass: store.pass,
              host: store.host,
              port: store.port,
              secure: store.secure,
              email: customer.email,
              subject,
              message,
              storeName: store.name,
              storeURL: store.url,
              storeLogo: store.logo,
              cardColor: store.loyaltyCard?.cardColor,
              textColor: store.loyaltyCard?.textColor,
              customerName: customer.name,
              customerEmail: customer.email,
              customerPhone: customer.phone,
            });
            console.log('[getOnePoint/L5] mailResponse:', mailResponse);
          } else {
            console.log('[getOnePoint/L5] ⚠️ Skipped sending email — missing getMessage or mailAfterLogin.subject');
          }
        } else {
          console.log('[getOnePoint/L5] ⚠️ Skipped sending email — store.email or store.pass missing');
        }

        if (store.smsToken) {
          if (
            getMessage &&
            getMessage.smsAfterLogin &&
            getMessage.smsAfterLogin.message
          ) {
            let from = getMessage.smsAfterLogin.from;
            let message = getMessage.smsAfterLogin.message;
            const smsResponse = await smsController.smsCustomer({
              token: store.smsToken,
              to: customer.phone,
              from,
              message,
              storeName: store.name,
              storeURL: store.url,
              customerName: customer.name,
              customerEmail: customer.email,
              customerPhone: customer.phone,
            });
            console.log(smsResponse);
          }
        }
        
        return updatedCustomer;
      }

      // Non-L5 format: original logic
      // Giving 1 point to customer
      const updatedCustomer = await customerModel
        .findByIdAndUpdate(
          customerId,
          { points: customer.points + 1, pointChangeDate: new Date() },
          { new: true }
        )
        .populate("store", "name email pass host port secure url smsToken logo loyaltyCard");

      // Points history
      await pointsHistoryModel.create({
        points: 1,
        customer: customer._id,
        store: customer.store._id,
      });
      
      // Update visit analytics - mark as signup to skip visit counting
      try {
        await updateVisitAnalytics(customer._id, customer.store._id, null, 1, true);
      } catch (analyticsError) {
        console.error('[getOnePoint] Analytics update failed:', analyticsError.message);
      }

      const nonL5Store = updatedCustomer.store;
      // Checking store Email and Pass to mail customer
      const getMessage = await mailSMSModel.findOne({ store: nonL5Store });
      console.log('[getOnePoint/nonL5] nonL5Store.email:', nonL5Store.email, '| host:', nonL5Store.host, '| port:', nonL5Store.port, '| secure:', nonL5Store.secure);
      console.log('[getOnePoint/nonL5] getMessage exists:', !!getMessage, '| mailAfterLogin:', JSON.stringify(getMessage?.mailAfterLogin));
      if (nonL5Store.email && nonL5Store.pass) {
        if (
          getMessage &&
          getMessage.mailAfterLogin &&
          getMessage.mailAfterLogin.subject
        ) {
          let subject = getMessage.mailAfterLogin.subject;
          let message = getMessage.mailAfterLogin.message;
          const mailResponse = await mailController.mailCustomers({
            user: nonL5Store.email,
            pass: nonL5Store.pass,
            host: nonL5Store.host,
            port: nonL5Store.port,
            secure: nonL5Store.secure,
            email: customer.email,
            subject,
            message,
            storeName: nonL5Store.name,
            storeURL: nonL5Store.url,
            storeLogo: nonL5Store.logo,
            cardColor: nonL5Store.loyaltyCard?.cardColor,
            textColor: nonL5Store.loyaltyCard?.textColor,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });
          console.log(mailResponse);
        }
      }

      // Checking store SMS Token to send SMS to customer
      if (nonL5Store.smsToken) {
        // const getSMS = await mailSMSModel.findOne({ store });
        if (
          getMessage &&
          getMessage.smsAfterLogin &&
          getMessage.smsAfterLogin.message
        ) {
          let from = getMessage.smsAfterLogin.from;
          let message = getMessage.smsAfterLogin.message;
          const smsResponse = await smsController.smsCustomer({
            token: nonL5Store.smsToken,
            to: customer.phone,
            from,
            message,
            storeName: nonL5Store.name,
            storeURL: nonL5Store.url,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
          });
          console.log(smsResponse);
        }
      }

      return updatedCustomer;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  async getStoreData(req, res) {
    try {
      const { storeURL } = req.params;
      const store = await storeModel.findOne({ url: storeURL });
      const getObjectParams = {
        Bucket: "samparka",
        Key: store.logo,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      store.logo = url;
      // Strip merchant-only fields before sending to the public store client
      const safeStore = store.toObject();
      delete safeStore.customerCode;
      return res.json({ success: true, store: safeStore });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  //CUSTOMER REDEEM REWARD
  async redeemReward(req, res) {
    try {
      const { rewardID } = req.params;
      const { billID, storeID } = req.query;

      // Checking Store
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      // Checking Reward
      const reward = await rewardModel.findById(rewardID);
      if (!reward) {
        return res.json({ success: false, message: "Reward not found" });
      }

      // Checking is the reward is evergreen or not
      if (!reward.evergreen) {
        const isAlreadyRedeemed = await redemptionModel.findOne({
          customer: req.user,
          reward: rewardID,
          store: storeID,
        });
        if (isAlreadyRedeemed) {
          return res.json({
            success: false,
            message: "Reward already redeemed",
          });
        }
      }

      // Checking customer points
      const customer = await customerModel.findById(req.user);
      if (customer.points < reward.points) {
        return res.json({ success: false, message: "Not enough points" });
      }

      // Updating customer to redeem reward
      const redeemReward = await customerModel.findByIdAndUpdate(
        req.user,
        {
          $inc: { points: -reward.points },
          $set: { pointChangeDate: new Date() },
        },
        { new: true }
      );

      // Creating New Redemption
      const redemption = await redemptionModel.create({
        store: storeID,
        customer: req.user,
        reward: rewardID,
        billID,
      });

      // Checking store Email and Pass to mail customer and admin
      const getMessage = await mailSMSModel.findOne({ store });
      console.log('[redeemReward] store.email:', store.email, '| store.host:', store.host, '| store.port:', store.port, '| store.secure:', store.secure);
      console.log('[redeemReward] getMessage exists:', !!getMessage, '| mailAfterRewardRedeemed:', JSON.stringify(getMessage?.mailAfterRewardRedeemed));
      if (store.email && store.pass) {
        if (
          getMessage &&
          getMessage.mailAfterRewardRedeemed &&
          getMessage.mailAfterRewardRedeemed.subject
        ) {
          let subject = getMessage.mailAfterRewardRedeemed.subject;
          let message = getMessage.mailAfterRewardRedeemed.message;
          const mailResponse = await mailController.mailCustomers({
            user: store.email,
            pass: store.pass,
            host: store.host,
            port: store.port,
            secure: store.secure,
            email: customer.email,
            subject,
            message,
            storeName: store.name,
            storeURL: store.url,
            storeLogo: store.logo,
            cardColor: store.loyaltyCard?.cardColor,
            textColor: store.loyaltyCard?.textColor,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            reward: reward.name,
          });
          if (
            getMessage.mailAfterRewardRedeemed_Admin &&
            getMessage.mailAfterRewardRedeemed_Admin.subject &&
            getMessage.mailAfterRewardRedeemed_Admin.to
          ) {
            let adminEmail = getMessage.mailAfterRewardRedeemed_Admin.to;
            let subject = getMessage.mailAfterRewardRedeemed_Admin.subject;
            let message = getMessage.mailAfterRewardRedeemed_Admin.message;
            const mailResponse2 = await mailController.mailCustomers({
              user: store.email,
              pass: store.pass,
              host: store.host,
              port: store.port,
              secure: store.secure,
              email: adminEmail,
              subject,
              message,
              storeName: store.name,
              storeURL: store.url,
              storeLogo: store.logo,
              cardColor: store.loyaltyCard?.cardColor,
              textColor: store.loyaltyCard?.textColor,
              customerName: customer.name,
              customerEmail: customer.email,
              customerPhone: customer.phone,
              reward: reward.name,
            });
            console.log(mailResponse2);
          }
          console.log(mailResponse);
        }
      }

      // Checking store SMS Token to send SMS to customer and admin
      if (store.smsToken) {
        // const getSMS = await mailSMSModel.findOne({ store });
        if (
          getMessage &&
          getMessage.smsAfterRewardRedeemed &&
          getMessage.smsAfterRewardRedeemed.message
        ) {
          let from = getMessage.smsAfterRewardRedeemed.from;
          let message = getMessage.smsAfterRewardRedeemed.message;
          const smsResponse = await smsController.smsCustomer({
            token: store.smsToken,
            to: customer.phone,
            from,
            message,
            storeName: store.name,
            storeURL: store.url,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            reward: reward.name,
          });
          console.log(smsResponse);
        }
        if (
          getMessage &&
          getMessage.smsAfterRewardRedeemed_Admin &&
          getMessage.smsAfterRewardRedeemed_Admin.message
        ) {
          let to = getMessage.smsAfterRewardRedeemed_Admin.to;
          let from = getMessage.smsAfterRewardRedeemed_Admin.from;
          let message = getMessage.smsAfterRewardRedeemed_Admin.message;
          const smsResponse = await smsController.smsCustomer({
            token: store.smsToken,
            to,
            from,
            message,
            storeName: store.name,
            storeURL: store.url,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            reward: reward.name,
          });
          console.log(smsResponse);
        }
      }

      // PUSH NOTIFICATION
      // if (
      //   getMessage &&
      //   getMessage.notificationAfterRewardRedeemed &&
      //   getMessage.notificationAfterRewardRedeemed.body
      // ) {
      //   let title = getMessage.notificationAfterRewardRedeemed.title;
      //   let body = getMessage.notificationAfterRewardRedeemed.body;
      //   const notificationResponse =
      //     await notificationController.singleNotification({
      //       title,
      //       body,
      //       userId: customer._id,
      //       storeName: store.name,
      //       storeURL: store.url,
      //       customerName: customer.name,
      //       customerEmail: customer.email,
      //       customerPhone: customer.phone,
      //       reward: reward.name,
      //     });
      //   console.log(notificationResponse);
      // }

      return res.json({
        success: true,
        message: "Reward redeemed successful",
        redeemReward,
        redemption,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  //CUSTOMER REDEEM L3 REWARD
  async redeemL3Reward(req, res) {
    try {
      const { rewardID } = req.params;
      const { storeID } = req.query;

      // Checking Store
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      // Checking Reward
      const reward = await rewardModel.findById(rewardID);
      if (!reward) {
        return res.json({ success: false, message: "Reward not found" });
      }

      // Checking Reward properties
      if (reward.type !== "constant" || !reward.redeemable) {
        return res.json({
          success: false,
          message: "Reward is not redeemable",
        });
      }

      // Checking Customer Tier
      const customer = req.user;
      console.log(customer);
      console.log(reward.tier);
      if (customer.tier !== reward.tier) {
        return res.json({
          success: false,
          message: "Tier mismatch for reward redemption",
        });
      }

      // Checking Redemption Limit
      const redemptionCount = await redemptionModel.countDocuments({
        customer: customer._id,
        reward: rewardID,
      });

      if (redemptionCount >= reward.redeemableTimes) {
        return res.json({
          success: false,
          message: "Redemption limit reached for this reward",
        });
      }

      // // Updating customer to redeem reward
      // const redeemReward = await customerModel.findByIdAndUpdate(
      //   req.user,
      //   {
      //     $set: { pointChangeDate: new Date() },
      //   },
      //   { new: true }
      // );

      // Creating New Redemption
      const redemption = await redemptionModel.create({
        store: storeID,
        customer: req.user,
        reward: rewardID,
      });

      // // Checking store Email and Pass to mail customer and admin
      // if (store.email && store.pass) {
      //   const getMessage = await mailSMSModel.findOne({ store });
      //   if (
      //     getMessage &&
      //     getMessage.mailAfterRewardRedeemed &&
      //     getMessage.mailAfterRewardRedeemed.subject
      //   ) {
      //     let subject = getMessage.mailAfterRewardRedeemed.subject;
      //     let message = getMessage.mailAfterRewardRedeemed.message;
      //     const mailResponse = await mailController.mailCustomers({
      //       user: store.email,
      //       pass: store.pass,
      //       email: customer.email,
      //       subject,
      //       message,
      //       storeName: store.name,
      //       storeURL: store.url,
      //       customerName: customer.name,
      //       customerEmail: customer.email,
      //       customerPhone: customer.phone,
      //       reward: reward.name,
      //     });
      //     if (
      //       getMessage.mailAfterRewardRedeemed_Admin &&
      //       getMessage.mailAfterRewardRedeemed_Admin.subject &&
      //       getMessage.mailAfterRewardRedeemed_Admin.to
      //     ) {
      //       let adminEmail = getMessage.mailAfterRewardRedeemed_Admin.to;
      //       let subject = getMessage.mailAfterRewardRedeemed_Admin.subject;
      //       let message = getMessage.mailAfterRewardRedeemed_Admin.message;
      //       const mailResponse2 = await mailController.mailCustomers({
      //         user: store.email,
      //         pass: store.pass,
      //         email: adminEmail,
      //         subject,
      //         message,
      //         storeName: store.name,
      //         storeURL: store.url,
      //         customerName: customer.name,
      //         customerEmail: customer.email,
      //         customerPhone: customer.phone,
      //         reward: reward.name,
      //       });
      //       console.log(mailResponse2);
      //     }
      //     console.log(mailResponse);
      //   }
      // }

      // // Checking store SMS Token to send SMS to customer and admin
      // if (store.smsToken) {
      //   const getSMS = await mailSMSModel.findOne({ store });
      //   if (
      //     getSMS &&
      //     getSMS.smsAfterRewardRedeemed &&
      //     getSMS.smsAfterRewardRedeemed.message
      //   ) {
      //     let from = getSMS.smsAfterRewardRedeemed.from;
      //     let message = getSMS.smsAfterRewardRedeemed.message;
      //     const smsResponse = await smsController.smsCustomer({
      //       token: store.smsToken,
      //       to: customer.phone,
      //       from,
      //       message,
      //       storeName: store.name,
      //       storeURL: store.url,
      //       customerName: customer.name,
      //       customerEmail: customer.email,
      //       customerPhone: customer.phone,
      //       reward: reward.name,
      //     });
      //     console.log(smsResponse);
      //   }
      //   if (
      //     getSMS &&
      //     getSMS.smsAfterRewardRedeemed_Admin &&
      //     getSMS.smsAfterRewardRedeemed_Admin.message
      //   ) {
      //     let from = getSMS.smsAfterRewardRedeemed_Admin.from;
      //     let message = getSMS.smsAfterRewardRedeemed_Admin.message;
      //     const smsResponse = await smsController.smsCustomer({
      //       token: store.smsToken,
      //       to: customer.phone,
      //       from,
      //       message,
      //       storeName: store.name,
      //       storeURL: store.url,
      //       customerName: customer.name,
      //       customerEmail: customer.email,
      //       customerPhone: customer.phone,
      //       reward: reward.name,
      //     });
      //     console.log(smsResponse);
      //   }
      // }

      return res.json({
        success: true,
        message: "Reward redeemed successful",
        // redeemReward,
        redemption,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  //CUSTOMER REDEEM L4 REWARD (with point deduction)
  async redeemL4Reward(req, res) {
    try {
      const { rewardID } = req.params;
      const { storeID, outletLocation, billID } = req.query;

      // Checking Store
      const storeModel = require("../models/storeModel");
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      // Verify store is using L4 format
      if (store.loyaltyCard?.format !== "L4") {
        return res.json({
          success: false,
          message: "This store is not using L4 loyalty format",
        });
      }

      // Checking Reward
      const rewardModel = require("../models/rewardModel");
      const reward = await rewardModel.findById(rewardID);
      if (!reward) {
        return res.json({ success: false, message: "Reward not found" });
      }

      // Checking Reward properties
      console.log(`[L4 Redemption] Reward check - Type: ${reward.type}, Redeemable: ${reward.redeemable}, PointCost: ${reward.pointCost}`);

      if (reward.type !== "l4") {
        return res.json({
          success: false,
          message: `Reward type is "${reward.type}" but must be "l4" for L4 stores`,
        });
      }

      if (!reward.redeemable) {
        return res.json({
          success: false,
          message: "Reward is not marked as redeemable. Please enable redemption for this reward in settings.",
        });
      }

      // Get customer
      const customerModel = require("../models/customerModel");
      const customer = await customerModel.findById(req.user);
      if (!customer) {
        return res.json({ success: false, message: "Customer not found" });
      }

      // Check if reward is tier-specific (if tier field exists on reward)
      if (reward.tier && customer.tier !== reward.tier) {
        return res.json({
          success: false,
          message: `This reward is only available for ${reward.tier} tier members`,
        });
      }

      // Check if customer has enough points
      const pointCost = reward.pointCost || 0;
      if (customer.points < pointCost) {
        return res.json({
          success: false,
          message: `Insufficient points. You need ${pointCost} points but have ${customer.points} points`,
        });
      }

      // Check Redemption Limit (if not evergreen)
      if (!reward.evergreen) {
        const redemptionModel = require("../models/redemptionModel");
        const redemptionCount = await redemptionModel.countDocuments({
          customer: customer._id,
          reward: rewardID,
        });

        if (redemptionCount >= reward.redeemableTimes) {
          return res.json({
            success: false,
            message: "Redemption limit reached for this reward",
          });
        }
      }

      // Deduct points from customer
      const balanceBefore = customer.points;
      customer.points -= pointCost;
      customer.pointChangeDate = new Date();
      await customer.save();

      // Create redemption record (status: pending — awaiting staff claim)
      const redemptionModel = require("../models/redemptionModel");
      const redemption = await redemptionModel.create({
        store: storeID,
        customer: req.user,
        reward: rewardID,
        outlet: outletLocation || null,
      });

      // NOTE: PointDeductionLog is intentionally NOT created here.
      // It is created only when staff claims the redemption via claimReward,
      // so the settlement report only shows rewards that have been physically confirmed by staff.

      console.log(`[L4] Customer ${customer.name} redeemed ${reward.name} for ${pointCost} points at ${outletLocation || 'unknown outlet'}. Balance: ${balanceBefore} → ${customer.points}. Awaiting staff claim.`);

      return res.json({
        success: true,
        message: "Reward redeemed successfully",
        redemption,
        pointsDeducted: pointCost,
        newBalance: customer.points,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  async redeemL6Reward(req, res) {
    try {
      const { rewardID } = req.params;
      const { storeID, outletLocation, billID } = req.query;

      const storeModel = require("../models/storeModel");
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store not found" });
      }

      if (store.loyaltyCard?.format !== "L6") {
        return res.json({
          success: false,
          message: "This store is not using L6 loyalty format",
        });
      }

      const rewardModel = require("../models/rewardModel");
      const reward = await rewardModel.findById(rewardID);
      if (!reward) {
        return res.json({ success: false, message: "Reward not found" });
      }

      console.log(`[L6 Redemption] Reward check - Type: ${reward.type}, Redeemable: ${reward.redeemable}, PointCost: ${reward.pointCost}`);

      if (reward.type !== "l6") {
        return res.json({
          success: false,
          message: `Reward type is "${reward.type}" but must be "l6" for L6 stores`,
        });
      }

      if (!reward.redeemable) {
        return res.json({
          success: false,
          message: "Reward is not marked as redeemable. Please enable redemption for this reward in settings.",
        });
      }

      const customerModel = require("../models/customerModel");
      const customer = await customerModel.findById(req.user);
      if (!customer) {
        return res.json({ success: false, message: "Customer not found" });
      }

      if (reward.tier && customer.tier !== reward.tier) {
        return res.json({
          success: false,
          message: `This reward is only available for ${reward.tier} tier members`,
        });
      }

      const pointCost = reward.pointCost || 0;
      if (customer.points < pointCost) {
        return res.json({
          success: false,
          message: `Insufficient points. You need ${pointCost} points but have ${customer.points} points`,
        });
      }

      if (!reward.evergreen) {
        const redemptionModel = require("../models/redemptionModel");
        const redemptionCount = await redemptionModel.countDocuments({
          customer: customer._id,
          reward: rewardID,
        });

        if (redemptionCount >= reward.redeemableTimes) {
          return res.json({
            success: false,
            message: "Redemption limit reached for this reward",
          });
        }
      }

      const balanceBefore = customer.points;
      customer.points -= pointCost;
      customer.pointChangeDate = new Date();
      await customer.save();

      const redemptionModel = require("../models/redemptionModel");
      const redemption = await redemptionModel.create({
        store: storeID,
        customer: req.user,
        reward: rewardID,
        outlet: outletLocation || null,
      });

      console.log(`[L6] Customer ${customer.name} redeemed ${reward.name} for ${pointCost} points at ${outletLocation || 'unknown outlet'}. Balance: ${balanceBefore} → ${customer.points}. Awaiting staff claim.`);

      return res.json({
        success: true,
        message: "Reward redeemed successfully",
        redemption,
        pointsDeducted: pointCost,
        newBalance: customer.points,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  //CUSTOMER GET MY REWARDS
  async getMyRewards(req, res) {
    try {
      console.log('[getMyRewards] ========== START ==========');
      console.log('[getMyRewards] Customer ID:', req.user);

      // Fetch customer to check store format
      const customer = await customerModel.findById(req.user).populate("store");
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }

      console.log('[getMyRewards] Customer:', customer.name);
      console.log('[getMyRewards] Store format:', customer.store?.loyaltyCard?.format);

      // Fetch regular redemptions
      const myRewards = await redemptionModel
        .find({ customer: req.user })
        .populate("reward")
        .lean();

      console.log('[getMyRewards] Regular rewards found:', myRewards.length);

      let allRewards = [...myRewards];

      // If store has L5 format, also fetch L5 redemptions
      if (customer.store?.loyaltyCard?.format === "L5") {
        console.log('[getMyRewards] L5 format detected, fetching L5 redemptions');

        const L5Redemption = require("../models/l5RedemptionModel");
        const l5Redemptions = await L5Redemption
          .find({
            customer: req.user,
            store: customer.store._id
          })
          .populate("outlet")
          .sort({ redemptionDate: -1 })
          .lean();

        console.log('[getMyRewards] L5 redemptions found:', l5Redemptions.length);

        // Transform L5 redemptions to match regular redemption structure
        const transformedL5Redemptions = l5Redemptions.map((l5Redemption) => {
          // Map L5 status to regular redemption status
          let mappedStatus = "pending";
          if (l5Redemption.status === "used") {
            mappedStatus = "claimed";
          } else if (l5Redemption.status === "expired") {
            mappedStatus = "expired";
          } else if (l5Redemption.status === "active" || l5Redemption.status === "pending") {
            mappedStatus = "pending";
          }

          // Create reward name display
          let rewardDisplayName = l5Redemption.rewardName || "L5 Reward";
          if (l5Redemption.rewardType === "discount" && l5Redemption.discountPercentage) {
            rewardDisplayName = `${l5Redemption.discountPercentage}% Discount`;
            if (l5Redemption.rewardName) {
              rewardDisplayName += ` - ${l5Redemption.rewardName}`;
            }
          }
          rewardDisplayName += ` (${l5Redemption.pointsThreshold} pts)`;

          // Add outlet location to display
          const outletInfo = l5Redemption.outlet?.location || l5Redemption.outlet?.name || "Unknown Outlet";
          rewardDisplayName += ` at ${outletInfo}`;

          return {
            _id: l5Redemption._id,
            id: l5Redemption._id,
            reward: {
              name: rewardDisplayName,
              _id: `l5-${l5Redemption._id}`,
            },
            customer: l5Redemption.customer,
            billID: l5Redemption.billID || "",
            redeemDate: l5Redemption.redemptionDate,
            expiryDate: l5Redemption.expiryDate,
            status: mappedStatus,
            createdAt: l5Redemption.redemptionDate,
            // Additional L5-specific fields for reference
            isL5Reward: true,
            outlet: l5Redemption.outlet,
            pointsThreshold: l5Redemption.pointsThreshold,
            rewardType: l5Redemption.rewardType,
          };
        });

        // Combine regular and L5 rewards
        allRewards = [...myRewards, ...transformedL5Redemptions];

        // Sort by redeem date (most recent first)
        allRewards.sort((a, b) => {
          const dateA = new Date(a.redeemDate || a.createdAt);
          const dateB = new Date(b.redeemDate || b.createdAt);
          return dateB - dateA;
        });

        console.log('[getMyRewards] Total rewards (regular + L5):', allRewards.length);
      }

      console.log('[getMyRewards] ========== SUCCESS ==========');
      return res.json({ success: true, myRewards: allRewards });
    } catch (error) {
      console.error('[getMyRewards] Error:', error);
      return res.status(500).send(error);
    }
  }

  //CUSTOMER RESERVATION
  async reservation(req, res) {
    try {
      const { tableNumber, numberofGuests, services, date, time, outlet, note } =
        req.body;

      if (!services || !date || !time) {
        return res.json({ success: false, message: "Required fields missing" });
      }

      const { storeURL } = req.params;
      const store = await storeModel.findOne({ url: storeURL });

      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }

      // ✅ Fetch the reservation settings for the store
      const reservationSetting = await reservationSettingModel.findOne({
        store: store._id,
      });

      if (reservationSetting?.needTimeSlots) {
        // Find the specific time slot based on time and outlet (if applicable)
        const selectedSlot = reservationSetting.timeSlots.find(
          (slot) =>
            slot.time === time &&
            (!store.services.multipleOutlets || slot.outlet === outlet)
        );

        // Only validate slot availability if this is a predefined time slot
        // Custom times (not in timeSlots array) are allowed without capacity checks
        if (selectedSlot) {
          // Build the query conditionally
          const query = {
            store: store._id,
            date: new Date(date),
            time,
          };

          if (store.services.multipleOutlets) {
            query.outlet = outlet;
          }

          const count = await reservationModel.countDocuments(query);

          if (count >= selectedSlot.numberOfSlots) {
            return res.json({
              success: false,
              message: "No more slots available for the selected time.",
            });
          }
        }
        // If selectedSlot is undefined, it's a custom time - allow it to proceed
      }

      // ✅ Create the reservation if slots are available
      const reserve = await reservationModel.create({
        customer: req.user || store._id,
        store: store._id,
        tableNumber,
        numberofGuests,
        services,
        date,
        time,
        outlet,
        note,
        status: reservationSetting?.autoConfirmation ? "confirmed" : "pending",
      });

      // Checking store Email and Pass to mail customer
      const getMessage = await mailSMSModel.findOne({ store });
      if (store.email && store.pass) {
        if (
          getMessage &&
          getMessage.mailAfterReservation_Admin &&
          getMessage.mailAfterReservation_Admin.subject &&
          getMessage.mailAfterReservation_Admin.to
        ) {
          let adminEmail = getMessage.mailAfterReservation_Admin.to;
          let subject = getMessage.mailAfterReservation_Admin.subject;
          let message = getMessage.mailAfterReservation_Admin.message;
          
          // Only send if adminEmail and customer data are valid
          if (adminEmail && req.user?.email) {
            const mailResponse = await mailController.mailCustomers({
              user: store.email,
              pass: store.pass,
              host: store.host,
              port: store.port,
              secure: store.secure,
              email: adminEmail,
              subject,
              message,
              storeName: store.name,
              storeURL: store.url,
              storeLogo: store.logo,
              cardColor: store.loyaltyCard?.cardColor,
              textColor: store.loyaltyCard?.textColor,
              customerName: req.user.name,
              customerEmail: req.user.email,
              customerPhone: req.user.phone,
            });
            console.log(mailResponse);
          }
        }
      }

      // Checking store SMS Token to send SMS to customer
      if (store.smsToken) {
        // const getSMS = await mailSMSModel.findOne({ store });
        if (
          getMessage &&
          getMessage.smsAfterReservation_Admin &&
          getMessage.smsAfterReservation_Admin.message &&
          getMessage.smsAfterReservation_Admin.to
        ) {
          let to = getMessage.smsAfterReservation_Admin.to;
          let from = getMessage.smsAfterReservation_Admin.from;
          let message = getMessage.smsAfterReservation_Admin.message;
          
          // Only send if recipient phone is valid
          if (to && req?.user?.phone) {
            const smsResponse = await smsController.smsCustomer({
              token: store.smsToken,
              to,
              from,
              message,
              storeName: store.name,
              storeURL: store.url,
              customerName: req?.user?.name,
              customerEmail: req?.user?.email,
              customerPhone: req?.user?.phone,
            });
            console.log(smsResponse);
          }
        }
      }

      // Define customer early for use in notifications
      const customer = req?.user;

      // Notification to admin after reservation
      if (
        customer &&
        getMessage &&
        getMessage.notificationAfterReservation_Admin &&
        getMessage.notificationAfterReservation_Admin.title
      ) {
        let title = getMessage.notificationAfterReservation_Admin.title;
        let body = getMessage.notificationAfterReservation_Admin.body;
        
        try {
          const notificationResponse =
            await notificationController.singleNotification({
              title,
              body,
              userId: store._id,
              storeName: store.name,
              storeURL: store.url,
              customerName: customer?.name,
              customerEmail: customer?.email,
              customerPhone: customer?.phone,
            });
          console.log(notificationResponse);
          if (notificationResponse?.success) {
            const receivers = [
              { customer: customer._id, read: false, readAt: null },
            ];
            // Create a notification document
            const notification = new notificationModel({
              store: store._id,
              title: title || "Notification",
              message: notificationResponse.formattedMessage || body || "New notification received.",
              receivers,
            });
            await notification.save();
          }
        } catch (notifError) {
          console.log("Notification error:", notifError.message);
          // Continue execution even if notification fails
        }
      }
      if (reservationSetting?.autoConfirmation && customer) {
        if (store.email && store.pass) {
          if (
            getMessage &&
            getMessage.mailAfterReservationConfirm &&
            getMessage.mailAfterReservationConfirm.subject &&
            customer?.email
          ) {
            let subject = getMessage.mailAfterReservationConfirm.subject;
            let message = getMessage.mailAfterReservationConfirm.message;
            const mailResponse = await mailController.mailCustomers({
              user: store.email,
              pass: store.pass,
              host: store.host,
              port: store.port,
              secure: store.secure,
              email: customer.email,
              subject,
              message,
              storeName: store.name,
              storeURL: store.url,
              storeLogo: store.logo,
              cardColor: store.loyaltyCard?.cardColor,
              textColor: store.loyaltyCard?.textColor,
              customerName: customer?.name,
              customerEmail: customer?.email,
              customerPhone: customer?.phone,
            });
            console.log(mailResponse);
          }
        }

        // Checking store SMS Token to send SMS to customer
        if (store.smsToken) {
          // const getSMS = await mailSMSModel.findOne({ store });
          if (
            getMessage &&
            getMessage.smsAfterReservationConfirm &&
            getMessage.smsAfterReservationConfirm.message &&
            customer?.phone
          ) {
            let from = getMessage.smsAfterReservationConfirm.from;
            let message = getMessage.smsAfterReservationConfirm.message;
            const smsResponse = await smsController.smsCustomer({
              token: store.smsToken,
              to: customer.phone,
              from,
              message,
              storeName: store.name,
              storeURL: store.url,
              customerName: customer?.name,
              customerEmail: customer?.email,
              customerPhone: customer?.phone,
            });
            console.log(smsResponse);
          }
        }

        if (
          getMessage &&
          getMessage.notificationAfterReservationConfirm &&
          getMessage.notificationAfterReservationConfirm.body &&
          customer?._id
        ) {
          let title = getMessage.notificationAfterReservationConfirm.title;
          let body = getMessage.notificationAfterReservationConfirm.body;
          
          try {
            const notificationResponse =
              await notificationController.singleNotification({
                title,
                body,
                userId: customer._id,
                storeName: store.name,
                storeURL: store.url,
                customerName: customer?.name,
                customerEmail: customer?.email,
                customerPhone: customer?.phone,
              });
            console.log(notificationResponse);
            if (notificationResponse?.success) {
              const receivers = [
                { customer: customer._id, read: false, readAt: null },
              ];
              // Create a notification document
              const notification = new notificationModel({
                store: store._id,
                title: title || "Notification",
                message: notificationResponse.formattedMessage || body || "New notification received.",
                receivers,
              });
              await notification.save();
            }
          } catch (notifError) {
            console.log("Confirmation notification error:", notifError.message);
            // Continue execution even if notification fails
          }
        }
      }

      return res.json({
        success: true,
        message: "Reservation Successful",
        reserve,
      });
    } catch (error) {
      console.log("Reservation error:", error);
      return res.status(500).send(error);
    }
  }

  //CUSTOMER GET MYRESERVATION
  async getReservations(req, res) {
    try {
      const reservations = await reservationModel
        .find({ customer: req.user })
        .populate("store", "name") // or add more fields if needed
        .sort({ createdAt: -1 });
      return res.json({ success: true, reservations });
    } catch (error) {
      console.log("Get Reservations Error:", error);
      return res.status(500).send(error);
    }
  }

  // GET notifications for a specific customer
  async getNotifications(req, res) {
    const { customerId } = req.params;

    try {
      // Find notifications where the customer is listed in the receivers array
      const notifications = await notificationModel
        .find({
          "receivers.customer": customerId,
        })
        .sort({ createdAt: -1 }) // Sort by newest first
        .select("title message createdAt receivers"); // select only required fields

      // Filter to include only relevant receiver info for this customer
      const filteredNotifications = notifications.map((notif) => {
        const customerReceiver = notif.receivers.find((r) =>
          r.customer.equals(customerId)
        );

        return {
          _id: notif._id,
          title: notif.title,
          message: notif.message,
          createdAt: notif.createdAt,
          read: customerReceiver?.read || false,
          readAt: customerReceiver?.readAt || null,
        };
      });

      res.status(200).json(filteredNotifications);
    } catch (error) {
      console.error("Error fetching customer notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  }

  // MARK notification as read
  async markNotificationAsRead(req, res) {
    const { customerId, notificationId } = req.params;
    try {
      const notification = await notificationModel.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      const receiver = notification.receivers.find((r) =>
        r.customer.equals(customerId)
      );
      if (!receiver) {
        return res
          .status(404)
          .json({ message: "Customer not a receiver of this notification" });
      }
      receiver.read = true;
      receiver.readAt = new Date();
      await notification.save();
      res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  }

  // CHECK if customer has notification subscription
  async checkNotificationSubscription(req, res) {
    const { customerId } = req.params;
    try {
      // Checking Customer
      const customer = await customerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      // Checking Subscription
      const subscriptions = await Subscription.find({ userId: customerId });
      const hasSubscription = subscriptions.length > 0;

      res.status(200).json({ hasSubscription });
    } catch (error) {
      console.error("Error checking notification subscription:", error);
      res.status(500).json({ message: "Failed to check subscription" });
    }
  }

  //// CHECKING.... // CHECKING LOCATION ////
  async checkLocation(req, res) {
    try {
      const { lat, lng } = req.body;
      const customerId = req.user.id;

      const customer = await customerModel
        .findById(customerId)
        .populate("store");
      const store = customer?.store;

      if (!store || !store.lat || !store.lng) {
        return res
          .status(404)
          .json({ message: "Store not found for this customer." });
      }

      const distance = getDistance(
        { latitude: lat, longitude: lng },
        { latitude: store.lat, longitude: store.lng }
      );

      if (distance <= 1000) {
        // Prevent spamming by checking last notification time
        let lastNotif = await NotificationLog.findOne({
          customerId,
          storeId: store._id,
        });

        // 🛑 You were using `userId`, but it should be `customerId`
        const userSubscription = await Subscription.findOne({
          userId: customerId,
        });

        if (!userSubscription) {
          console.warn("No push subscription found for this user.");
          return res.sendStatus(200);
        }

        const hoursSinceLast = lastNotif
          ? (Date.now() - new Date(lastNotif.sentAt).getTime()) / (1000 * 60)
          : Infinity;

        console.log(hoursSinceLast);
        if (hoursSinceLast >= 2) {
          // Send Web Push
          await webpush.sendNotification(
            userSubscription.subscription,
            JSON.stringify({
              title: `👋 ${store.name} misses you!`,
              body: `Free item waiting just for you. Come visit!`,
            })
          );

          // await NotificationLog.create({
          //   customerId,
          //   storeId: store._id,
          //   sentAt: new Date(),
          // })
          if (!lastNotif) {
            lastNotif = await NotificationLog.create({
              customerId,
              storeId: store._id,
              sentAt: new Date(),
            });
          } else {
            lastNotif.sentAt = new Date();
            await lastNotif.save();
          }
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("checkLocation error:", error);
      return res.status(500).send({ error: "Server error occurred" });
    }
  }

  async getPointsHistory(req, res) {
    try {
      const customerId = req.user._id;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const skip = (page - 1) * limit;

      // Filter to only show records where points increased (points > 0)
      const filter = { customer: customerId, points: { $gt: 0 } };

      const [history, total] = await Promise.all([
        pointsHistoryModel
          .find(filter)
          .select("points billID outlet remarks createdAt")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        pointsHistoryModel.countDocuments(filter),
      ]);

      return res.send({
        history,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("getPointsHistory error:", error);
      return res.status(500).send({ error: "Failed to fetch points history" });
    }
  }

  // Send OTP for customer registration
  sendCustomerOTP = async (req, res) => {
    try {
      const { phone, countryCode } = req.body;
      const { storeURL } = req.params;

      if (!phone) {
        return res.json({ success: false, message: "Phone number is required" });
      }

      // Find store
      const store = await storeModel.findOne({ url: storeURL });
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found" });
      }

      // Check if store requires phone OTP
      if (!store.requirePhoneOTP) {
        return res.json({ success: false, message: "Phone OTP not enabled for this store" });
      }

      // Check rate limiting - max 3 OTP requests per phone per 10 minutes
      const existingCustomer = await customerModel.findOne({
        store: store._id,
        phone: phone,
      });

      if (existingCustomer && existingCustomer.otpLastSent) {
        const timeSinceLastOTP = Date.now() - new Date(existingCustomer.otpLastSent).getTime();
        const tenMinutes = 10 * 60 * 1000;
        
        // If last OTP was sent less than 1 minute ago, block
        if (timeSinceLastOTP < 60 * 1000) {
          return res.json({ 
            success: false, 
            message: "Please wait before requesting another OTP",
            waitTime: Math.ceil((60 * 1000 - timeSinceLastOTP) / 1000)
          });
        }
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP in database (create or update temporary customer record)
      if (existingCustomer) {
        existingCustomer.otp = otp;
        existingCustomer.otpExpiry = otpExpiry;
        existingCustomer.otpAttempts = 0;
        existingCustomer.otpLastSent = new Date();
        await existingCustomer.save();
      } else {
        // Create a temporary customer record with just phone and OTP
        await customerModel.findOneAndUpdate(
          { store: store._id, phone: phone },
          {
            phone: phone,
            countryCode: countryCode || "+977",
            name: "Pending Verification",
            email: `pending_${phone}@temp.com`,
            store: store._id,
            otp: otp,
            otpExpiry: otpExpiry,
            otpAttempts: 0,
            otpLastSent: new Date(),
          },
          { upsert: true, new: true }
        );
      }

      // Send OTP via SMS
      // Sparrow SMS expects Nepal numbers without country code prefix
      // For Nepal (+977), use just the phone number. For others, use full international format
      let smsPhone = phone.toString();
      if (countryCode === "+977" || !countryCode) {
        // Nepal domestic number - remove country code if present in phone
        smsPhone = smsPhone.replace(/^977/, "");
      } else {
        // International number - include country code without +
        smsPhone = `${countryCode}${phone}`.replace(/\+/g, "");
      }
      
      const payload = {
        token: process.env.SPARROW_SMS_TOKEN,
        from: "TheAlert",
        to: smsPhone,
        text: `Your ${store.name} verification code is ${otp}. Valid for 5 minutes.`,
      };

      console.log(`Sending OTP to: ${smsPhone} (original: ${phone}, country: ${countryCode})`);

      try {
        const response = await axios.post(
          "http://api.sparrowsms.com/v2/sms/",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.response_code === 200) {
          return res.json({ 
            success: true, 
            message: "OTP sent successfully",
            expiresIn: 300 // 5 minutes in seconds
          });
        } else {
          console.error("SMS API error:", response.data);
          
          // Handle specific Sparrow SMS error codes
          let errorMessage = "Failed to send OTP";
          if (response.data.response_code === 1001) {
            errorMessage = "SMS service configuration issue. Please contact support.";
          } else if (response.data.response) {
            errorMessage = response.data.response;
          }
          
          return res.json({ success: false, message: errorMessage });
        }
      } catch (smsError) {
        console.error("SMS sending error:", smsError);
        console.error("SMS Error Response:", smsError.response?.data);
        
        // Handle axios errors from SMS API
        let errorMessage = "Failed to send OTP. Please try again.";
        if (smsError.response) {
          const data = smsError.response.data;
          console.log("Sparrow SMS Error Details:", JSON.stringify(data, null, 2));
          if (data && data.response_code === 1001) {
            errorMessage = "SMS service is temporarily unavailable. Please contact support.";
          } else if (data && data.response) {
            errorMessage = data.response;
          }
        }
        
        return res.json({ success: false, message: errorMessage });
      }
    } catch (error) {
      console.error("sendCustomerOTP error:", error);
      return res.json({ success: false, message: "Unable to send OTP. Please try again later." });
    }
  };

  // Send OTP via email for email-based login
  sendCustomerEmailOTP = async (req, res) => {
    try {
      const { email } = req.body;
      const { storeURL } = req.params;

      if (!email) {
        return res.json({ success: false, message: "Email address is required" });
      }
      if (!require("validator").isEmail(email)) {
        return res.json({ success: false, message: "Invalid email address" });
      }

      const store = await storeModel.findOne({ url: storeURL });
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found" });
      }
      if (!store.requireEmailOTP) {
        return res.json({ success: false, message: "Email OTP not enabled for this store" });
      }

      // Rate limiting - max 1 OTP per 60 seconds per email
      const existingCustomer = await customerModel.findOne({ store: store._id, email });
      if (existingCustomer && existingCustomer.otpLastSent) {
        const timeSinceLastOTP = Date.now() - new Date(existingCustomer.otpLastSent).getTime();
        if (timeSinceLastOTP < 60 * 1000) {
          return res.json({
            success: false,
            message: "Please wait before requesting another OTP",
            waitTime: Math.ceil((60 * 1000 - timeSinceLastOTP) / 1000),
          });
        }
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      if (existingCustomer) {
        existingCustomer.otp = otp;
        existingCustomer.otpExpiry = otpExpiry;
        existingCustomer.otpAttempts = 0;
        existingCustomer.otpLastSent = new Date();
        await existingCustomer.save();
      } else {
        // Create temp record — use unique negative phone as placeholder
        const tempPhone = -(Math.floor(Math.random() * 900000000) + 100000000);
        await customerModel.findOneAndUpdate(
          { store: store._id, email },
          {
            email,
            name: "Pending Verification",
            phone: tempPhone,
            countryCode: "+977",
            store: store._id,
            otp,
            otpExpiry,
            otpAttempts: 0,
            otpLastSent: new Date(),
          },
          { upsert: true, new: true }
        );
      }

      // Send OTP via email using nodemailer
      // Use store's SMTP if configured, otherwise fall back to Samparka Gmail
      const nodemailer = require("nodemailer");
      const hasStoreSmtp = store.email && store.pass;
      let transportConfig;
      if (hasStoreSmtp) {
        transportConfig =
          store.host && store.port
            ? {
                host: store.host,
                port: Number(store.port),
                secure: store.secure === "ssl",
                ...(store.secure === "none" && { ignoreTLS: true }),
                auth: { user: store.email, pass: store.pass },
              }
            : { service: "gmail", auth: { user: store.email, pass: store.pass } };
      } else {
        transportConfig = {
          service: "gmail",
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        };
      }
      const transporter = nodemailer.createTransport(transportConfig);
      const fromAddress = hasStoreSmtp ? store.email : process.env.EMAIL_USER;
      await transporter.sendMail({
        from: `"${store.name}" <${fromAddress}>`,
        to: email,
        subject: `Your ${store.name} verification code`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
            <h2 style="color:#016e49;margin-bottom:8px;">${store.name}</h2>
            <p style="color:#374151;font-size:15px;">Your verification code is:</p>
            <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;text-align:center;padding:20px 0;">${otp}</div>
            <p style="color:#6b7280;font-size:13px;">Valid for 5 minutes. Do not share this code with anyone.</p>
          </div>`,
      });

      return res.json({ success: true, message: "Verification code sent to your email", expiresIn: 300 });
    } catch (error) {
      console.error("❌ sendCustomerEmailOTP error:", error);
      return res.json({ success: false, message: "Failed to send verification code. Please try again." });
    }
  };

  // Verify OTP and complete registration
  verifyOTPAndRegister = async (req, res) => {
    try {
      let { name, email, phone, gender, dob, countryCode, otp, method } = req.body;
      const { storeURL } = req.params;
      const isEmailMethod = method === "email";

      // Validate required fields based on method
      if (isEmailMethod) {
        if (!email || !otp) {
          return res.json({ success: false, message: "Email and OTP are required" });
        }
      } else {
        if (!phone || !otp) {
          return res.json({ success: false, message: "Phone and OTP are required" });
        }
      }

      // Find store
      const store = await storeModel.findOne({ url: storeURL });
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found" });
      }

      // Check if store requires OTP for the given method
      if (isEmailMethod && !store.requireEmailOTP) {
        return res.json({ success: false, message: "Email OTP not enabled for this store" });
      }
      if (!isEmailMethod && !store.requirePhoneOTP) {
        return res.json({ success: false, message: "Phone OTP not enabled for this store" });
      }

      // Find customer with pending OTP
      const customer = isEmailMethod
        ? await customerModel.findOne({ store: store._id, email })
        : await customerModel.findOne({ store: store._id, phone });

      if (!customer) {
        return res.json({ success: false, message: "Please request OTP first" });
      }

      // Master customer-code bypass — skip attempts, expiry and OTP check
      const isCustomerCodeBypass =
        store.customerCode && otp === store.customerCode;

      if (!isCustomerCodeBypass) {
        // Check OTP attempts
        if (customer.otpAttempts >= 5) {
          return res.json({
            success: false,
            message: "Too many failed attempts. Please request a new OTP.",
            maxAttemptsReached: true,
          });
        }

        // Check OTP expiry
        if (!customer.otpExpiry || new Date() > new Date(customer.otpExpiry)) {
          return res.json({
            success: false,
            message: "OTP has expired. Please request a new OTP.",
            expired: true,
          });
        }

        // Verify OTP
        if (customer.otp !== otp) {
          customer.otpAttempts += 1;
          await customer.save();
          return res.json({
            success: false,
            message: "Invalid OTP",
            remainingAttempts: 5 - customer.otpAttempts,
          });
        }
      }

      // OTP verified — determine if existing or new customer
      const isExistingCustomer = isEmailMethod
        ? customer.name !== "Pending Verification"
        : customer.name !== "Pending Verification" && customer.email !== `pending_${phone}@temp.com`;

      if (isExistingCustomer) {
        // Existing customer — log them in
        customer.otp = undefined;
        customer.otpExpiry = undefined;
        customer.otpAttempts = 0;
        if (dob) customer.dob = dob;
        if (gender) customer.gender = gender;
        // For email method: update phone if a real phone was provided
        if (isEmailMethod && phone && Number(phone) > 0) {
          customer.phone = phone;
          customer.countryCode = countryCode || "+977";
        }
        await customer.save();

        return res.json({
          success: true,
          message: "Login Successful",
          customer,
          token: generateToken(customer._id, "365 days"),
          isNew: false,
        });
      }

      // New customer — require name to complete profile
      if (!name) {
        return res.json({
          success: false,
          message: "Please complete your profile to continue",
          needsProfile: true,
        });
      }

      // For phone method: email is required to complete registration
      const registrationEmail = isEmailMethod ? customer.email : email;
      if (!registrationEmail) {
        return res.json({
          success: false,
          message: "Please complete your profile to continue",
          needsProfile: true,
        });
      }
      if (!require("validator").isEmail(registrationEmail)) {
        return res.json({ success: false, message: "Invalid email address" });
      }

      // Check email uniqueness (only relevant for phone method where email is new)
      if (!isEmailMethod) {
        const emailExists = await customerModel.findOne({
          store: store._id,
          email: registrationEmail,
          phone: { $ne: phone },
        });
        if (emailExists) {
          return res.json({ success: false, message: "Email already registered" });
        }
      }

      const tier = store?.loyaltyCard?.tier?.[0]?.name || "Bronze Tier";
      customer.name = name;
      customer.email = registrationEmail;
      customer.tier = tier;
      customer.countryCode = countryCode || "+977";
      if (dob) customer.dob = dob;
      if (gender) customer.gender = gender;

      // For email method: set real phone if provided, otherwise keep placeholder
      if (isEmailMethod && phone && Number(phone) > 0) {
        customer.phone = phone;
      }
      // For phone method: phone is already set on the record
      customer.otp = undefined;
      customer.otpExpiry = undefined;
      customer.otpAttempts = 0;
      await customer.save();

      let updatedCustomer = customer;
      if (store?.givePointsOnRegister) {
        updatedCustomer = await this.getOnePoint(customer._id, storeURL);
      }

      return res.json({
        success: true,
        message: "Registration Successful",
        customer: updatedCustomer,
        token: generateToken(customer._id, "365 days"),
        isNew: true,
      });
    } catch (error) {
      console.error("❌ verifyOTPAndRegister error:", error);
      return res.json({ success: false, message: "Verification failed. Please try again." });
    }
  };

  checkPhoneAvailability = async (req, res) => {
    try {
      const { storeURL } = req.params;
      const { phone } = req.query;

      if (!phone) {
        return res.json({ success: false, message: "Phone is required" });
      }

      const store = await storeModel.findOne({ url: storeURL });
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found" });
      }

      // Exclude pending/temp records (name = "Pending Verification")
      const existing = await customerModel.findOne({
        store: store._id,
        phone: Number(phone),
        name: { $ne: "Pending Verification" },
      });

      return res.json({ success: true, exists: !!existing });
    } catch (error) {
      console.error("❌ [checkPhoneAvailability] Error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  checkEmailAvailability = async (req, res) => {
    try {
      const { storeURL } = req.params;
      const { email } = req.query;

      if (!email) {
        return res.json({ success: false, message: "Email is required" });
      }

      const store = await storeModel.findOne({ url: storeURL });
      if (!store) {
        return res.status(404).json({ success: false, message: "Store not found" });
      }

      // Exclude pending/temp records (name = "Pending Verification")
      const existing = await customerModel.findOne({
        store: store._id,
        email: email.trim().toLowerCase(),
        name: { $ne: "Pending Verification" },
      });

      return res.json({ success: true, exists: !!existing });
    } catch (error) {
      console.error("❌ [checkEmailAvailability] Error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

module.exports = new CustomerController();
