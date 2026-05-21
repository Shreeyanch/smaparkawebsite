const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const storeModel = require("../models/storeModel");
const validator = require("validator");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config.js");
const mailController = require("./mailController.js");
const mailSMSModel = require("../models/mailSMSModel.js");
const smsController = require("./smsController.js");
const notificationController = require("./notificationController.js");

class OrderController {
  async makeOrder(req, res) {
    try {
      let {
        userName,
        userPhone,
        userAddress,
        storeId,
        products,
        Orderdate,
        time,
        extraNotes,
        tableNo,
        deliveryCharge,
      } = req.body;
      console.log("Request body: ", req.body);

      if (!validator.isMobilePhone(userPhone)) {
        return res.json({ success: false, message: "Invalid Phone Number" });
      }

      if (typeof products[0] === "string") {
        products = products.map((product) => JSON.parse(product));
      }

      if (
        !userName ||
        !userPhone ||
        !storeId ||
        !products ||
        products.length === 0
      ) {
        return res.status(400).json({
          message: "Missing required fields or no products in the order.",
        });
      }

      let totalAmount = 0;
      products.forEach((product) => {
        totalAmount += product.productTotalPrice;
      });

      const newOrder = new Order({
        userName,
        userPhone,
        userAddress,
        storeId,
        products,
        Orderdate,
        time,
        extraNotes,
        tableNo,
        deliveryCharge: deliveryCharge || 0,
        totalAmount:
          parseFloat(totalAmount) + (parseFloat(deliveryCharge) || 0),
        status: "pending",
      });

      if (req.file) {
        // S3 upload
        const imageName = Date.now().toString() + "-" + req.file.originalname;
        const putObjectParams = {
          Bucket: "samparka",
          Key: imageName,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };
        const putCommand = new PutObjectCommand(putObjectParams);
        await s3.send(putCommand);

        newOrder.image = imageName;
      }

      // Save the order
      const savedOrder = await newOrder.save();

      // Loop through each product and check if stock tracking is enabled
      for (let product of products) {
        const productInDb = await Product.findById(product.productId);

        if (productInDb && productInDb.trackStock) {
          // If trackStock is true, update the product stock
          productInDb.stock -= product.productQuantity; // Subtract the ordered quantity
          if (productInDb.stock < 0) {
            productInDb.stock = 0; // Prevent stock from going negative
          }

          // Save the updated product stock
          await productInDb.save();
        }
      }

      // Checking store Email and Pass to mail customer
      const getMessage = await mailSMSModel.findOne({ store: storeId });
      const store = await storeModel.findById(storeId);
      // if (store.email && store.pass) {
      //   if (
      //     getMessage &&
      //     getMessage.mailAfterPurchase_Admin &&
      //     getMessage.mailAfterPurchase_Admin.subject
      //   ) {
      //     let subject = getMessage.mailAfterPurchase_Admin.subject;
      //     let message = getMessage.mailAfterPurchase_Admin.message;
      //     const mailResponse = await mailController.mailCustomers({
      //       user: store.email,
      //       pass: store.pass,
      //       host: store.host,
      //       port: store.port,
      //       secure: store.secure,
      //       email: customer.email,
      //       subject,
      //       message,
      //       points: receivedPoints,
      //       storeName: store.name,
      //       storeURL: store.url,
      //       customerName: customer.name,
      //       customerEmail: customer.email,
      //       customerPhone: customer.phone,
      //     });
      //     console.log("Mail Response: ", mailResponse);
      //   }
      // }

      // Checking store SMS Token to send SMS to customer
      if (store.smsToken) {
        // const getSMS = await mailSMSModel.findOne({ store });
        if (
          getMessage &&
          getMessage.mailAfterPurchase_Admin &&
          getMessage.mailAfterPurchase_Admin.message
        ) {
          let from = getMessage.mailAfterPurchase_Admin.from;
          let message = getMessage.mailAfterPurchase_Admin.message;
          const smsResponse = await smsController.smsCustomer({
            token: store.smsToken,
            to: userPhone,
            from,
            message,
            storeName: store.name,
            storeURL: store.url,
            customerName: userName,
            customerPhone: userPhone,
          });
          console.log("smsResponse: ", smsResponse);
        }
      }

      // PUSH NOTIFICATION
      // if (
      //   getMessage &&
      //   getMessage.mailAfterPurchase_Admin &&
      //   getMessage.mailAfterPurchase_Admin.body
      // ) {
      //   let title = getMessage.mailAfterPurchase_Admin.title;
      //   let body = getMessage.mailAfterPurchase_Admin.body;
      //   const notificationResponse =
      //     await notificationController.singleNotification({
      //       title,
      //       body,
      //       userId: customer._id,
      //       points: receivedPoints,
      //       storeName: store.name,
      //       storeURL: store.url,
      //       customerName: customer.name,
      //       customerEmail: customer.email,
      //       customerPhone: customer.phone,
      //     });
      //   console.log("notification Response: ", notificationResponse);
      //   if (notificationResponse.success) {
      //     const receivers = [
      //       { customer: customer._id, read: false, readAt: null },
      //     ];
      //     // Create a notification document
      //     const notification = new notificationModel({
      //       store: store._id,
      //       title: title || "Notification",
      //       message: body || "New notification received.",
      //       receivers,
      //     });
      //     await notification.save();
      //   }
      // }

      return res.status(200).json({
        message: "Order created successfully",
        order: savedOrder,
        success: true,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getOrder(req, res) {
    const { storeId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    try {
      const checkStore = await storeModel.findOne({ _id: storeId });
      if (checkStore) {
        try {
          // Parse and validate pagination parameters
          const pageNum = Math.max(1, parseInt(page) || 1);
          const limitNum = Math.min(Math.max(1, parseInt(limit) || 10), 100); // Cap at 100
          const skip = (pageNum - 1) * limitNum;

          // Get total count for pagination metadata
          const totalOrders = await Order.countDocuments({ storeId });

          // Fetch paginated orders, sorted by most recent first using orderDate
          const orders = await Order.find({ storeId })
            .sort({ orderDate: -1, _id: -1 })
            .skip(skip)
            .limit(limitNum);

          // Process images for signed URLs
          for (const order of orders) {
            if (order.image) {
              const getObjectParams = {
                Bucket: "samparka",
                Key: order.image,
              };
              const command = new GetObjectCommand(getObjectParams);
              const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
              order.image = url;
            }
          }

          // Calculate total pages (handle division by zero)
          const totalPages = limitNum > 0 ? Math.ceil(totalOrders / limitNum) : 0;

          // Return paginated data with metadata
          return res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            orders,
            pagination: {
              currentPage: pageNum,
              totalPages,
              totalOrders,
              limit: limitNum,
              hasNextPage: pageNum < totalPages,
              hasPrevPage: pageNum > 1,
            },
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Error fetching orders" });
        }
      } else {
        return res.status(404).json({ message: "Store not found" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching store" });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { storeId } = req.params;
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required headers" });
      }

      // Validate status
      const validStatuses = ["pending", "paid", "failed"];
      if (!validStatuses.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status value" });
      }

      const order = await Order.findByIdAndUpdate(orderId, {
        status: status,
      });

      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      order.status = status;
      await order.save();

      res
        .status(200)
        .json({ success: true, message: `Order marked as ${status}`, order });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async deleteOrderStatus(req, res) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing required headers" });
      }
      const order = await Order.findByIdAndDelete(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order Id not found" });
      }
      res
        .status(200)
        .json({ success: true, message: "Order deleted succesfully" });
    } catch (error) {
      console.error("Error deleting order", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async updateOrderDetails(req, res) {
    try {
      const { orderId } = req.params;
      const { userName, userAddress, userPhone } = req.body;
      if (!orderId) {
        return res.status(404).json({
          success: false,
          message: "Order Id not found",
        });
      }

      if (!userName || !userAddress || !userPhone) {
        return res.status(400).json({
          success: false,
          message: "Update Fields are missing",
        });
      }

      const order = await Order.findByIdAndUpdate(orderId, {
        userName,
        userAddress,
        userPhone,
      });
      if (!order) {
        return res.status(404).json({
          success: true,
          message: "Order Id isn't valid",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Order updated succesfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Order Update failed ${error.message}`,
      });
    }
  }
}
module.exports = new OrderController();
