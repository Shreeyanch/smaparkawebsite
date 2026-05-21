// import mongoose from "mongoose";
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  subject: { type: String, default: "" },
  message: { type: String, default: "" },
});

const adminMessageSchema = new mongoose.Schema({
  to: { type: String, default: "" },
  subject: { type: String, default: "" },
  message: { type: String, default: "" },
});

const smsSchema = new mongoose.Schema({
  from: { type: String, default: "" },
  message: { type: String, default: "" },
});
const adminSMSSchema = new mongoose.Schema({
  to: { type: Number, default: "" },
  from: { type: String, default: "" },
  message: { type: String, default: "" },
});
const notificationSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  body: { type: String, default: "" },
});

const pointExpireNotificationSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  body: { type: String, default: "" },
  daysBeforeExpiry: { type: [Number], default: [7, 3, 1] }, // Days before expiry to send notification
});

// Main schema
const mailSMSSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true,
    },

    // Mail
    mailAfterLogin: {
      type: messageSchema,
      default: () => ({
        subject: "Welcome to our loyalty program!",
        message: `Hi [customer_name],<br/><br/>
        Welcome aboard! Your account has been successfully created. <br/>
        Here are your details: <br/>
        Name: [customer_name] <br/>
        Email: [customer_email] <br/>
        Phone: [customer_phone] <br/><br/>
        Store Link: [store_link] <br/><br/>
        Start earning stamps and enjoy rewards with every visit. <br/><br/>
        Warm regards, <br/>
        The [store_name] Team`,
      }),
    },
    mailAfterCreateCustomer: {
      type: messageSchema,
      default: () => ({
        subject: "Welcome to our loyalty program!",
        message: `Hi [customer_name],<br/><br/>
        Welcome aboard! Your account has been successfully created. <br/>
        Here are your details: <br/>
        Name: [customer_name] <br/>
        Email: [customer_email] <br/>
        Phone: [customer_phone] <br/><br/>
        Store Link: [store_link] <br/><br/>
        Start earning stamps and enjoy rewards with every visit. <br/><br/>
        Warm regards, <br/>
        The [store_name] Team`,
      }),
    },
    mailOnBirthday: {
      type: messageSchema,
      default: () => ({
        subject: "Happy Birthday! 🎉",
        message: `Hi [customer_name], <br/><br/>
        Wishing you the happiest birthday from all of us at Grinders Coffee!
        Celebrate your day with us, <br/><br/>
        The [store_name] Team`,
      }),
    },
    mailAfterPointEarned: {
      type: messageSchema,
      default: () => ({
        subject: "You just earned new points!!",
        message: `Hi [customer_name], <br/><br/>
        Good news! You’ve earned [points_earned] points. 🎉
        Keep collecting points to unlock exciting rewards. <br/><br/>
        Login: [store_link] <br/><br/>
        Cheers,
        The [store_name] Team`,
      }),
    },
    mailAfterRewardClaimed: {
      type: messageSchema,
      default: () => ({
        subject: "Your reward has been claimed",
        message: `Hi [customer_name], <br/><br/>
        Your reward [reward_name] has been successfully claimed.
        Check your rewards anytime: [store_link]
        Enjoy your benefits, <br/><br/>
        The [store_name] Team`,
      }),
    },
    mailAfterRewardRedeemed: {
      type: messageSchema,
      default: () => ({
        subject: "You’ve redeemed your reward!",
        message: `Hi [customer_name], <br/><br/>
        You’ve successfully redeemed your reward: [reward_name]. 🎉 <br/><br/>
        View your updated points and reward status on your account page: [store_link] <br/><br/>
        Thank you for being part of [store_name]. <br/><br/>
        The [store_name] Team`,
      }),
    },
    mailAfterReservationConfirm: {
      type: messageSchema,
      default: () => ({
        subject: "Your reservation is confirmed.",
        message: `Hi [customer_name], <br/><br/>
        Your reservation with [store_name] is confirmed.
        We’re excited to see you soon! <br/><br/>
        Warm regards, <br/>
        The [store_name] Team`,
      }),
    },
    mailAfterReservation_Admin: {
      type: adminMessageSchema,
      default: () => ({
        subject: "New reservation received",
        message: `Hello Admin, <br/><br/>
        A new reservation has been made by [customer_name]. <br/><br/>
        Customer Details: <br/>
        Email: [customer_email] <br/>
        Phone: [customer_phone] <br/>
        Manage reservations here: https://www.samparka.co/ <br/><br/> 
        Samparka System`,
      }),
    },
    mailAfterRewardRedeemed_Admin: {
      type: adminMessageSchema,
      default: () => ({
        subject: "Your customer has redeemed a reward",
        message: `Hello Admin, <br/><br/>
        [customer_name] has redeemed [reward_name]. <br/><br/>
        Customer Details: <br/>
        Email: [customer_email] <br/>
        Phone: [customer_phone] <br/><br/>
        View full details here: https://www.samparka.co/ <br/>
        Samparka System`,
      }),
    },
    mailAfterPurchase_Admin: {
      type: adminMessageSchema,
      default: () => ({
        subject: "Your customer has purchased a product",
        message: `Hello Admin, <br/><br/>
        [customer_name] has purchased a product. <br/><br/>
        Customer Details: <br/>
        Email: [customer_email] <br/>
        Phone: [customer_phone] <br/><br/>
        View full details here: https://www.samparka.co/ <br/>
        Samparka System`,
      }),
    },

    // SMS
    smsAfterLogin: {
      type: smsSchema,
      default: () => ({
        from: "TheAlert",
        message: "Namaste, welcome to [store_name]'s Loyalty Program.",
      }),
    },
    smsAfterPointEarned: {
      type: smsSchema,
      default: () => ({
        from: "TheAlert",
        message:
          "Hi [customer_name], you just earned [points_earned] points at [store_name].",
      }),
    },
    smsAfterRewardRedeemed: {
      type: smsSchema,
      default: () => ({
        from: "TheAlert",
        message:
          "Hi [customer_name], you’ve successfully redeemed “[reward_name]” at [store_name].",
      }),
    },
    smsAfterRewardClaimed: { type: smsSchema, default: () => ({}) },
    smsAfterCreateCustomer: { type: smsSchema, default: () => ({}) },
    smsOnBirthday: {
      type: smsSchema,
      default: () => ({
        from: "TheAlert",
        message: "Happy Birthday [customer_name]!",
      }),
    },
    smsAfterReservationConfirm: {
      type: smsSchema,
      default: () => ({
        from: "TheAlert",
        message:
          "Hello [customer_name], your reservation is confirmed. We look forward to seeing you soon!",
      }),
    },
    smsAfterReservation_Admin: { type: adminSMSSchema, default: () => ({}) },
    smsAfterRewardRedeemed_Admin: {
      type: adminSMSSchema,
      default: () => ({}),
    },
    smsAfterPurchase_Admin: {
      type: adminSMSSchema,
      default: () => ({}),
    },

    // notifications
    notificationAfterPointEarned: {
      type: notificationSchema,
      default: () => ({
        title: "[points_earned] Points Earned !⭐️",
        body: "Hey, [customer_name]! Your points just went up. Keep going and unlock rewards faster!",
      }),
    },
    notificationAfterRewardRedeemed: {
      type: notificationSchema,
      default: () => ({
        title: "You Redeemed [reward_name]! ✨",
        body: "[customer_name], your reward has been successfully redeemed. Enjoy it!",
      }),
    },
    notificationAfterRewardClaimed: {
      type: notificationSchema,
      default: () => ({
        title: "Reward Claimed! 🙌",
        body: "[customer_name], you’ve claimed “[reward_name]”. Don’t forget to use it before it expires!",
      }),
    },
    notificationOnBirthday: {
      type: notificationSchema,
      default: () => ({ title: "", body: "" }),
    },
    notificationAfterReservationConfirm: {
      type: notificationSchema,
      default: () => ({
        title: "Reservation Confirmed ✅",
        body: "Thanks [customer_name], your reservation is confirmed. We look forward to seeing you soon!",
      }),
    },
    notificationAfterReservation_Admin: {
      type: notificationSchema,
      default: () => ({}),
    },
    notificationAfterRewardRedeem_Admin: {
      type: notificationSchema,
      default: () => ({}),
    },
    notificationAfterPurchase_Admin: {
      type: notificationSchema,
      default: () => ({}),
    },
    notificationOnPointExpire: {
      type: pointExpireNotificationSchema,
      default: () => ({
        title: "Points Expiring Soon! ⏰",
        body: "Hi [customer_name], your loyalty points will expire in [days_remaining] day(s). Use them before they're gone!",
        daysBeforeExpiry: [7, 3, 1],
      }),
    },
    // notificationAfterLogin: { type: notificationSchema, default: () => ({}) },
    // notificationAfterCreateCustomer: { type: notificationSchema, default: () => ({}) },
    // notificationAfterRewardRedeemed_Admin: {
    //   type: notificationSchema,
    //   default: () => ({}),
    // },
  },
  { timestamps: true }
);

// export default mongoose.model("MailSMS", mailSMSSchema);
module.exports = mongoose.model("MailSMS", mailSMSSchema);
