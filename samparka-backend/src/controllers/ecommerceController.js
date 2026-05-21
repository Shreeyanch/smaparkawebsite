const Store = require("../models/storeModel");
const { DeleteObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config.js");

class EcommerceController {
  async saveOrEditInfo(req, res) {
    const { storeId } = req.params;
    const { storeName, socials, storeDescription, storeBanner } = req.body;

    try {
      if (!storeId) {
        return res.status(400).json({
          success: false,
          message: "Store Id Missing",
        });
      }

      let store = await Store.findById({ _id: storeId });

      if (store) {
        if (store.services.ecommerce) {
          store.services.ecommerce.whatsappNumber = whatsappNumber;
          store.services.ecommerce.socials = socials;
          store.services.ecommerce.storeBanner = storeBanner;
        } else {
          store.services.ecommerce = {
            whatsappNumber,
            socials,
            storeBanner,
            status: true,
          };
        }

        // Handle image upload or replacement
        if (req.file) {
          const oldImage = store.services.ecommerce.storeBanner;

          if (oldImage) {
            // If an old image exists, delete it from S3
            const deleteParams = {
              Bucket: "samparka",
              Key: oldImage, // Old image key
            };
            await s3.send(new DeleteObjectCommand(deleteParams));
          }

          // Upload the new image to S3
          const newImageName =
            Date.now().toString() + "-" + req.file.originalname;
          const putObjectParams = {
            Bucket: "samparka",
            Key: newImageName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
          };
          await s3.send(new PutObjectCommand(putObjectParams));

          // Update the store's banner with the new image key
          store.services.ecommerce.storeBanner = newImageName;
        }

        await store.save();
        return res.status(200).json({
          message: "Store Info inserted",
          store,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to add Store Info",
        error: error.message || error,
      });
    }
  }
}

module.exports = new EcommerceController();
