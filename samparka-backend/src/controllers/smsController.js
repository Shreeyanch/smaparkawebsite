// import axios from "axios";
const axios = require("axios");

class SmsController {
  async sendOTP(phoneNumber) {
    if (!phoneNumber) {
      return res
        .status(400)
        .json({ error: "Phone number and OTP are required" });
    }

    const payload = {
      token: process.env.SPARROW_SMS_TOKEN,
      from: "TheAlert",
      to: phoneNumber,
      text: `Hello, welcome to our service! Your OTP is 277353.`,
    };

    try {
      const response = await axios.post(
        "https://api.sparrowsms.com/v2/sms/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.response_code === 200) {
        return { success: true, message: "SMS sent successfully" };
      } else {
        return { error: "SMS API response error", details: response.data };
      }
    } catch (error) {
      return {
        error: "Error sending SMS",
        details: error.response ? error.response.data : error.message,
      };
    }
  }

  async smsCustomer({
    token,
    to,
    from,
    message,
    points,
    reward,
    storeName,
    storeURL,
    customerName,
    customerEmail,
    customerPhone,
  }) {
    if (!to) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const formattedMessage = message
      .replace("[points_earned]", points)
      .replace("[reward_name]", reward)
      .replace("[store_name]", storeName)
      .replace("[store_link]", `https://${storeURL}.samparka.co/loyality`)
      .replace("[customer_name]", customerName)
      .replace("[customer_email]", customerEmail)
      .replace("[customer_phone]", customerPhone);

    const payload = {
      token,
      from: "TheAlert",
      to: String(to),
      text: formattedMessage,
    };

    // const payload = {
    //   token: process.env.SPARROW_SMS_TOKEN,
    //   from: "TheAlert",
    //   to: "9813215178",
    //   text: `Hello, You received Points.`,
    // };

    try {
      const response = await axios.post(
        "http://api.sparrowsms.com/v2/sms/",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.response_code === 200) {
        return { success: true, message: "SMS sent successfully" };
      } else {
        return { error: "SMS API response error", details: response.data };
      }
    } catch (error) {
      return {
        error: "Error sending SMS",
        details: error.response ? error.response.data : error.message,
      };
    }
  }
}
module.exports = new SmsController();
