// import mailSMSModel from "../models/mailSMSModel.js";
// import storeModel from "../models/storeModel.js";
const mailSMSModel = require("../models/mailSMSModel");
const storeModel = require("../models/storeModel");
const validator = require("validator");

// Default push notification templates for all notification types
const NOTIFICATION_DEFAULTS = {
  notificationAfterPointEarned: {
    title: "[points_earned] Points Earned !⭐️",
    body: "Hey, [customer_name]! Your points just went up. Keep going and unlock rewards faster!",
  },
  notificationAfterRewardRedeemed: {
    title: "You Redeemed [reward_name]! ✨",
    body: "[customer_name], your reward has been successfully redeemed. Enjoy it!",
  },
  notificationAfterRewardClaimed: {
    title: "Reward Claimed! 🙌",
    body: "[customer_name], you've claimed \"[reward_name]\". Don't forget to use it before it expires!",
  },
  notificationAfterReservationConfirm: {
    title: "Reservation Confirmed ✅",
    body: "Thanks [customer_name], your reservation is confirmed. We look forward to seeing you soon!",
  },
  notificationOnPointExpire: {
    title: "Points Expiring Soon! ⏰",
    body: "Hi [customer_name], your loyalty points will expire in [days_remaining] day(s). Use them before they're gone!",
  },
};

class MailSMSController {
  async configMessage(req, res) {
    try {
      const { storeID } = req.params;
      const { status } = req.body;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        let mailSMS;
        switch (status) {
          case "afterLogin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { mailAfterLogin: { ...req.body } },
              { new: true }
            );
            break;
          case "afterCreateCustomer":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { mailAfterCreateCustomer: { ...req.body } },
              { new: true }
            );
            break;
          case "afterPointEarned":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { mailAfterPointEarned: { ...req.body } },
              { new: true }
            );
            break;
          case "afterRewardRedeemed":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { mailAfterRewardRedeemed: { ...req.body } },
              { new: true }
            );
            break;
          case "afterRewardRedeemed_admin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { mailAfterRewardRedeemed_Admin: { ...req.body } },
              { new: true }
            );
            break;
          case "afterRewardClaimed":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { mailAfterRewardClaimed: { ...req.body } },
              { new: true }
            );
            break;
          case "onBirthday":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { mailOnBirthday: { ...req.body } },
              { new: true }
            );
            break;
          case "afterReservationConfirm":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { mailAfterReservationConfirm: { ...req.body } },
              { new: true }
            );
            break;
          case "afterReservation_Admin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { mailAfterReservation_Admin: { ...req.body } },
              { new: true }
            );
            break;
          case "afterPurchase_Admin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { mailAfterPurchase_Admin: { ...req.body } },
              { new: true }
            );
            break;
          default:
            break;
        }

        return res.json({ success: true, message: "Message Saved", mailSMS });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  async getConfigMessage(req, res) {
    try {
      const { storeID } = req.params;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        let mailSMS = await mailSMSModel.findOne({ store });
        if (!mailSMS) {
          mailSMS = await mailSMSModel.create({ store });
        }

        // Auto-initialize any empty notification fields with defaults so push
        // notifications work immediately without requiring manual Save clicks
        const updateFields = {};
        for (const [key, defaults] of Object.entries(NOTIFICATION_DEFAULTS)) {
          if (!mailSMS[key]?.body) {
            updateFields[key] = defaults;
          }
        }
        if (Object.keys(updateFields).length > 0) {
          mailSMS = await mailSMSModel.findOneAndUpdate(
            { store },
            { $set: updateFields },
            { new: true }
          );
        }

        return res.json({ success: true, mailSMS });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  async getConfigSMS(req, res) {
    try {
      const { storeID } = req.params;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        const mailSMS = await mailSMSModel.findOne({ store });
        return res.json({ success: true, mailSMS });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  async configSMSMessage(req, res) {
    try {
      const { storeID } = req.params;
      const { status, to } = req.body;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        if (to) {
          if (!validator.isMobilePhone("+977" + to, "ne-NP")) {
            return res.json({
              success: false,
              message: "Invalid Phone Number",
            });
          }
        }
        let mailSMS;
        switch (status) {
          case "afterLogin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { smsAfterLogin: { ...req.body } },
              { new: true }
            );
            break;
          case "afterCreateCustomer":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { smsAfterCreateCustomer: { ...req.body } },
              { new: true }
            );
            break;
          case "afterPointEarned":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { smsAfterPointEarned: { ...req.body } },
              { new: true }
            );
            break;
          case "afterRewardRedeemed":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { smsAfterRewardRedeemed: { ...req.body } },
              { new: true }
            );
            break;
          case "afterRewardRedeemed_admin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { smsAfterRewardRedeemed_Admin: { ...req.body } },
              { new: true }
            );
            break;
          case "afterRewardClaimed":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { smsAfterRewardClaimed: { ...req.body } },
              { new: true }
            );
            break;
          case "onBirthday":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { smsOnBirthday: { ...req.body } },
              { new: true }
            );
            break;
          case "afterReservationConfirm":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { smsAfterReservationConfirm: { ...req.body } },
              { new: true }
            );
            break;
          case "afterReservation_Admin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { smsAfterReservation_Admin: { ...req.body } },
              { new: true }
            );
            break;
          case "afterPurchase_Admin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { smsAfterPurchase_Admin: { ...req.body } },
              { new: true }
            );
            break;
          default:
            break;
        }

        return res.json({ success: true, message: "Message Saved", mailSMS });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  async getConfigNotifications(req, res) {
    try {
      const { storeID } = req.params;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        const mailSMS = await mailSMSModel.findOne({ store });
        return res.json({ success: true, mailSMS });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }

  async configNotifications(req, res) {
    try {
      const { storeID } = req.params;
      const { status } = req.body;
      const store = await storeModel.findById(storeID);
      if (!store) {
        return res.json({ success: false, message: "Store Not Found" });
      }
      if (req.user._id.equals(store.user[0]) || req.user.role === "admin") {
        let mailSMS;
        switch (status) {
          case "afterLogin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationAfterLogin: { ...req.body } },
              { new: true }
            );
            break;
          case "afterCreateCustomer":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationAfterCreateCustomer: { ...req.body } },
              { new: true }
            );
            break;
          case "afterPointEarned":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationAfterPointEarned: { ...req.body } },
              { new: true }
            );
            break;
          case "afterRewardRedeemed":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationAfterRewardRedeemed: { ...req.body } },
              { new: true }
            );
            break;
          case "afterRewardRedeemed_admin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationAfterRewardRedeemed_Admin: { ...req.body } },
              { new: true }
            );
            break;
          case "afterRewardClaimed":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationAfterRewardClaimed: { ...req.body } },
              { new: true }
            );
            break;
          case "onBirthday":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationOnBirthday: { ...req.body } },
              { new: true }
            );
            break;
          case "afterReservationConfirm":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationAfterReservationConfirm: { ...req.body } },
              { new: true }
            );
            break;
          case "afterReservation_Admin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationAfterReservation_Admin: { ...req.body } },
              { new: true }
            );
            break;
          case "afterPurchase_Admin":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationAfterPurchase_Admin: { ...req.body } },
              { new: true }
            );
            break;
          case "onPointExpire":
            mailSMS = await mailSMSModel.findOneAndUpdate(
              { store },
              { notificationOnPointExpire: { ...req.body } },
              { new: true }
            );
            break;
          default:
            break;
        }

        return res.json({ success: true, message: "Message Saved", mailSMS });
      } else {
        return res.json({ success: false, message: "Access Denied" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }
  // Initialize push notification defaults for ALL stores belonging to the user
  // This is a one-time bulk operation so no manual Save is needed per store
  async initializeAllNotifications(req, res) {
    try {
      let stores;
      if (req.user.role === "admin") {
        stores = await storeModel.find();
      } else {
        stores = await storeModel.find({ user: req.user._id });
      }

      let initialized = 0;
      let skipped = 0;

      for (const store of stores) {
        let mailSMS = await mailSMSModel.findOne({ store: store._id });
        if (!mailSMS) {
          mailSMS = await mailSMSModel.create({ store: store._id });
        }

        const updateFields = {};
        for (const [key, defaults] of Object.entries(NOTIFICATION_DEFAULTS)) {
          if (!mailSMS[key]?.body) {
            updateFields[key] = defaults;
          }
        }

        if (Object.keys(updateFields).length > 0) {
          await mailSMSModel.findOneAndUpdate(
            { store: store._id },
            { $set: updateFields },
            { new: true }
          );
          initialized++;
        } else {
          skipped++;
        }
      }

      return res.json({
        success: true,
        message: `Push notifications initialized for ${initialized} store(s). ${skipped} store(s) were already configured.`,
        initialized,
        skipped,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  }
}

module.exports = new MailSMSController();
