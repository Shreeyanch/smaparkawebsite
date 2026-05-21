const webpush = require("web-push");
const Subscription = require("../models/Subscription");
const notificationModel = require("../models/notificationModel");

class NotificationController {
  // **Send Notification**
  async singleNotification({
    title,
    body,
    userId,
    points,
    reward,
    storeName,
    storeURL,
    customerName,
    customerEmail,
    customerPhone,
    storeId,
  }) {
    try {
      // Format message first
      const formattedMessage = body
        .replace(/\[points_earned\]/g, points)
        .replace(/\[reward_name\]/g, reward)
        .replace(/\[store_name\]/g, storeName)
        .replace(/\[store_link\]/g, `https://${storeURL}.samparka.co/loyality`)
        .replace(/\[customer_name\]/g, customerName)
        .replace(/\[customer_email\]/g, customerEmail)
        .replace(/\[customer_phone\]/g, customerPhone);

      // Always save notification to database if storeId is provided (for campaign notifications)
      // This ensures notification history is saved even if push fails
      if (storeId) {
        const notification = new notificationModel({
          store: storeId,
          title: title || "Notification",
          message: formattedMessage || "New notification received.",
          receivers: [{
            customer: userId,
            read: false,
            readAt: null,
          }],
        });
        await notification.save();
      }

      // Check for push subscription
      const userSubscription = await Subscription.findOne({ userId });

      if (!userSubscription) {
        console.warn(`No push subscription for userId: ${userId}`);
        return {
          success: false,
          message: "No subscription found for this user",
          formattedMessage,
          error: "NO_SUBSCRIPTION",
        };
      }

      const payload = JSON.stringify({
        title: title || "Notification",
        body: formattedMessage || "New notification received.",
        data: {
          type: "points-earned",
          points: points || 0,
          storeName: storeName || "",
          timestamp: Date.now()
        }
      });

      await webpush.sendNotification(userSubscription.subscription, payload);
      return { success: true, message: "Notification sent!", formattedMessage };
    } catch (error) {
      console.error("Error sending notification:", error);
      
      // Handle expired or unregistered subscriptions (410 Gone, 404 Not Found)
      if (error.statusCode === 404 || error.statusCode === 410) {
        console.warn(
          `Removing expired subscription for userId: ${userId}`,
          error.body || error.message
        );
        await Subscription.deleteOne({ userId });
        return {
          success: false,
          message: "Subscription expired and removed",
          formattedMessage,
          error: "SUBSCRIPTION_EXPIRED",
        };
      }
      
      return { success: false, message: "Failed to send notification", formattedMessage };
    }
  }

  // **Send Single Notification**
  async sendNotification(req, res) {
    const userId = req.params.userId;
    try {
      const userSubscription = await Subscription.findOne({ userId });

      if (!userSubscription) {
        return res
          .status(404)
          .json({ message: "No subscription found for this user" });
      }
      const payload = req.body
        ? JSON.stringify(req.body)
        : JSON.stringify({
            title: "Verification Approved",
            body: "Your verification request has been approved by the admin!",
          });
      await webpush.sendNotification(userSubscription.subscription, payload);
      res.status(200).json({ message: "Notification sent!" });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ message: "Failed to send notification" });
    }
  }

  // **Send Notification to Multiple Users**
  async multipleNotification(req, res) {
    try {
      const { userIds, title, body, storeId } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "No users selected." });
      }

      // Fetch subscriptions for the selected users
      const subscriptions = await Subscription.find({
        userId: { $in: userIds },
      });

      if (subscriptions.length === 0) {
        return res
          .status(404)
          .json({ message: "No subscriptions found for selected users." });
      }

      // Prepare the notification payload
      const payload = JSON.stringify({
        title: title || "Notification",
        body: body || "New notification received.",
      });

      // Create a notification document (linked to all selected users)
      const notification = new notificationModel({
        store: storeId,
        title: title || "Notification",
        message: body || "New notification received.",
        receivers: userIds.map((userId) => ({
          customer: userId,
          read: false,
          readAt: null,
        })),
      });

      await notification.save();

      // Send notification to each subscription
      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(sub.subscription, payload);
        } catch (err) {
          if (
            err.statusCode === 404 ||
            (err.statusCode === 410 &&
              err.body?.includes('"reason":"Unregistered"'))
          ) {
            console.warn(
              `Removing expired subscription for userId: ${sub.userId}`
            );
            await Subscription.deleteOne({ _id: sub._id });
          } else {
            console.error(`Failed to send to userId: ${sub.userId}`, err);
          }
        }
      }

      res
        .status(200)
        .json({ message: "Notifications sent and saved successfully!" });
    } catch (error) {
      console.error("Error sending notifications:", error);
      res.status(500).json({
        message: "Failed to send and save notifications.",
        error: error.message || error,
      });
    }
  }

  // **Get Notifications**
  async getNotifications(req, res) {
    try {
      // Assuming you have a store ID to fetch notifications for that store
      const { storeId } = req.params; // You may pass this in query params
      const notifications = await notificationModel
        .find({ store: storeId })
        .sort({
          createdAt: -1,
        }); // Sort notifications by created date

      res.json(notifications); // Send back the notifications in the response
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  }
}

module.exports = new NotificationController();
