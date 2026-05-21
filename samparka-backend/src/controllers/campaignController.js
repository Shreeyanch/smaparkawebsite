const campaignService = require("../services/campaignService");
const s3 = require("../config/s3Config");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

class CampaignController {
  /**
   * GET /api/campaigns/:storeId
   * List campaigns for a store with pagination
   */
  async listCampaigns(req, res) {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const result = await campaignService.getCampaigns(storeId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
      });

      res.json({
        success: true,
        data: result.campaigns,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      console.error("listCampaigns error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch campaigns",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/campaigns/:storeId/:campaignId
   * Get a single campaign by ID
   */
  async getCampaign(req, res) {
    try {
      const { campaignId } = req.params;

      const campaign = await campaignService.getCampaignById(campaignId);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found",
        });
      }

      res.json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      console.error("getCampaign error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch campaign",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/campaigns/:storeId
   * Create a new campaign
   */
  async createCampaign(req, res) {
    try {
      const { storeId } = req.params;
      const userId = req.user?._id; // Assuming auth middleware sets req.user

      const {
        name,
        segments,
        customerIds,
        channel,
        messageType,
        templateId,
        customMessage,
        scheduledFor,
        sendNow,
        campaignImageKey,
      } = req.body;

      // Validation
      if (!name || !channel || !messageType) {
        return res.status(400).json({
          success: false,
          message: "Name, channel, and messageType are required",
        });
      }

      if (!segments?.length && !customerIds?.length) {
        return res.status(400).json({
          success: false,
          message: "At least one segment or customer must be selected",
        });
      }

      if (messageType === "custom" && !customMessage?.body) {
        return res.status(400).json({
          success: false,
          message: "Custom message body is required",
        });
      }

      if (channel === "email" && messageType === "custom" && !customMessage?.subject?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email subject is required",
        });
      }

      if (messageType === "template" && !templateId) {
        return res.status(400).json({
          success: false,
          message: "Template ID is required when using template message type",
        });
      }

      const campaign = await campaignService.createCampaign(
        storeId,
        {
          name,
          segments,
          customerIds,
          channel,
          messageType,
          templateId,
          customMessage,
          scheduledFor,
          sendNow,
          campaignImageKey: channel === "email" ? campaignImageKey : undefined,
        },
        userId
      );

      res.status(201).json({
        success: true,
        message: sendNow
          ? "Campaign created and sending started"
          : scheduledFor
          ? "Campaign scheduled successfully"
          : "Campaign created as draft",
        data: campaign,
      });
    } catch (error) {
      console.error("createCampaign error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create campaign",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/campaigns/:storeId/:campaignId
   * Cancel a scheduled or draft campaign
   */
  async cancelCampaign(req, res) {
    try {
      const { campaignId } = req.params;

      const campaign = await campaignService.cancelCampaign(campaignId);

      res.json({
        success: true,
        message: "Campaign cancelled successfully",
        data: campaign,
      });
    } catch (error) {
      console.error("cancelCampaign error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to cancel campaign",
      });
    }
  }

  /**
   * POST /api/campaigns/:storeId/:campaignId/send
   * Trigger immediate send for a draft/scheduled campaign
   */
  async triggerSend(req, res) {
    try {
      const { campaignId } = req.params;

      const campaign = await campaignService.processCampaign(campaignId);

      res.json({
        success: true,
        message: "Campaign sending started",
        data: campaign,
      });
    } catch (error) {
      console.error("triggerSend error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to send campaign",
      });
    }
  }

  /**
   * GET /api/campaigns/:storeId/customers/at-risk
   * Get at-risk customers for selection
   */
  async getAtRiskCustomers(req, res) {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 10, search } = req.query;

      const result = await campaignService.getCustomersBySpecialSegment(
        storeId,
        "at_risk",
        {
          page: parseInt(page),
          limit: parseInt(limit),
          search,
        }
      );

      res.json({
        success: true,
        data: result.customers,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      console.error("getAtRiskCustomers error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch at-risk customers",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/campaigns/:storeId/customers/churned
   * Get churned customers for selection
   */
  async getChurnedCustomers(req, res) {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 10, search } = req.query;

      const result = await campaignService.getCustomersBySpecialSegment(
        storeId,
        "churned",
        {
          page: parseInt(page),
          limit: parseInt(limit),
          search,
        }
      );

      res.json({
        success: true,
        data: result.customers,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      console.error("getChurnedCustomers error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch churned customers",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/campaigns/:storeId/customers/segment-counts
   * Get counts for special segments (at-risk and churned)
   */
  async getSegmentCounts(req, res) {
    try {
      const { storeId } = req.params;

      const [atRiskCount, churnedCount] = await Promise.all([
        campaignService.getSpecialSegmentCount(storeId, "at_risk"),
        campaignService.getSpecialSegmentCount(storeId, "churned"),
      ]);

      res.json({
        success: true,
        data: {
          at_risk: atRiskCount,
          churned: churnedCount,
        },
      });
    } catch (error) {
      console.error("getSegmentCounts error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch segment counts",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/campaigns/:storeId/templates/:channel
   * Get available templates for a messaging channel
   */
  async getTemplates(req, res) {
    try {
      const { storeId, channel } = req.params;

      if (!["sms", "push", "email"].includes(channel)) {
        return res.status(400).json({
          success: false,
          message: "Invalid channel. Must be sms, push, or email",
        });
      }

      const templates = await campaignService.getTemplatesForChannel(
        storeId,
        channel
      );

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error("getTemplates error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch templates",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/campaigns/:storeId/preview
   * Preview recipient count without creating campaign
   */
  async previewRecipients(req, res) {
    try {
      const { storeId } = req.params;
      const { segments = [], customerIds = [] } = req.body;

      const recipients = await campaignService.resolveRecipients(storeId, {
        segments,
        customerIds,
      });

      res.json({
        success: true,
        data: {
          count: recipients.length,
          // Return first few recipients as preview
          preview: recipients.slice(0, 5).map((r) => ({
            name: r.customerName,
            phone: r.customerPhone,
            email: r.customerEmail,
          })),
        },
      });
    } catch (error) {
      console.error("previewRecipients error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to preview recipients",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/campaigns/upload-image
   * Upload a campaign email image to S3. Returns the S3 key.
   */
  async uploadCampaignImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image provided" });
      }
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ success: false, message: "File must be an image" });
      }

      const ext = req.file.originalname.split(".").pop().toLowerCase();
      const key = `campaign-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: "samparka",
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );

      res.json({ success: true, imageKey: key });
    } catch (error) {
      console.error("❌ uploadCampaignImage error:", error);
      res.status(500).json({ success: false, message: "Image upload failed" });
    }
  }
}

module.exports = new CampaignController();
