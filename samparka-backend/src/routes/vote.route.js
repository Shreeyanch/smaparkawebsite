const { Router } = require("express");
const Vote = require("../models/Vote");
const axios = require("axios");

const router = Router();

// Send OTP
router.post("/send-otp", async (req, res) => {
  const { phoneNumber, otp } = req.body;
  if (!phoneNumber || !otp) {
    return res
      .status(400)
      .json({ success: false, error: "Missing phone number or OTP" });
  }

  const alreadyVoted = await Vote.findOne({
    votersPhoneNumber: phoneNumber,
  });

  if (alreadyVoted) {
    return res.status(400).json({
      message: "You have already casted your vote.",
    });
  }

  const payload = {
    token: process.env.SPARROW_SMS_TOKEN,
    from: "TheAlert",
    to: phoneNumber,
    text: `Hello, Your OTP is ${otp}. Use it to verify to vote.`,
  };

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
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ success: false, error: response.data });
    }
  } catch (error) {
    console.error("SMS sending error:", error.response);
    return res.status(500).json({
      success: false,
      error: error.response ? error.response.data : error.message,
    });
  }
});

// get votes
router.get("/", async (req, res) => {
  try {
    const allVotes = await Vote.find({});
    res.status(200).json(allVotes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// cast vote
router.post("/", async (req, res) => {
  try {
    const { contestantName, votersPhoneNumber } = req.body;

    if (!contestantName || !votersPhoneNumber) {
      return res.status(400).json({
        message: "Contestant name and voter phone number are required.",
      });
    }

    // Check if this phone number has already voted
    const alreadyVoted = await Vote.findOne({
      votersPhoneNumber: votersPhoneNumber,
    });

    if (alreadyVoted) {
      return res.status(400).json({
        message: "You have already casted your vote.",
      });
    }

    // Check if contestant already exists
    const contestantVote = await Vote.findOne({ contestantName });

    if (contestantVote) {
      contestantVote.vote += 1;
      contestantVote.votersPhoneNumber.push(votersPhoneNumber);
      await contestantVote.save();

      return res.status(200).json({
        success: true,
        message: `Vote updated for ${contestantName} by ${votersPhoneNumber}`,
      });
    } else {
      // Create new contestant vote record
      const newVote = new Vote({
        contestantName,
        votersPhoneNumber: [votersPhoneNumber],
        vote: 1,
      });

      await newVote.save();

      return res.status(200).json({
        success: true,
        message: `Vote cast for ${contestantName} by ${votersPhoneNumber}`,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
