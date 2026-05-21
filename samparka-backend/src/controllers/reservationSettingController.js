const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config");
const ReservationSetting = require("../models/reservationSettingModel");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

class ReservationServiceController {
  // Get all services for a store
  async getServices(req, res) {
    try {
      const { storeID } = req.params;

      const reservationSetting = await ReservationSetting.findOne({
        store: storeID,
      }).populate("store", "name");

      if (!reservationSetting) {
        return res.status(200).json({
          success: true,
          data: [],
        });
      }

      // Transform images inside services with full S3 signed URLs
      const services = await Promise.all(
        reservationSetting.services.map(async (service) => {
          const signedImages = await Promise.all(
            service.images.map(async (key) => {
              const getObjectParams = {
                Bucket: "samparka",
                Key: key,
              };
              const command = new GetObjectCommand(getObjectParams);
              return getSignedUrl(s3, command);
            })
          );

          return {
            ...service.toObject(), // Convert Mongoose subdocument to plain object
            images: signedImages,
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      console.error("Error in getServices:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch services",
      });
    }
  }

  // Get single service by ID
  async getServiceById(req, res) {
    try {
      const { storeID, serviceID } = req.params;

      const reservationSetting = await ReservationSetting.findOne({
        store: storeID,
      });

      if (!reservationSetting) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      const service = reservationSetting.services.id(serviceID);

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        });
      }

      const signedImages = await Promise.all(
        (service.images || []).map(async (key) => {
          const getObjectParams = { Bucket: "samparka", Key: key };
          const command = new GetObjectCommand(getObjectParams);
          return getSignedUrl(s3, command);
        })
      );

      const serviceData = {
        ...service.toObject(), // Convert subdocument to plain object (important)
        images: signedImages,
      };

      return res.status(200).json({
        success: true,
        data: serviceData,
      });
    } catch (error) {
      console.error("Error in getServiceById:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch service",
      });
    }
  }

  // Create/Add new service
  async createService(req, res) {
    const uploadedImageKeys = [];

    try {
      const { storeID } = req.params;
      const {
        name,
        description,
        price,
        outlet,
        autoConfirmation,
        needTimeSlots,
        timeSlots,
      } = req.body;

      const files = req.files || [];
      console.log('Files received in backend:', files.length);
      console.log('Files details:', files.map(f => ({ name: f.originalname, type: f.mimetype, size: f.size })));

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      // Upload images to S3
      console.log('Starting S3 upload...');
      for (const file of files) {
        console.log('Uploading file to S3:', file.originalname);
        const imageKey = `${Date.now()}-${file.originalname}`;
        const uploadParams = {
          Bucket: "samparka",
          Key: imageKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        await s3.send(new PutObjectCommand(uploadParams));
        console.log('Successfully uploaded to S3:', imageKey);
        uploadedImageKeys.push(imageKey);
      }
      console.log('All images uploaded. Keys:', uploadedImageKeys);

      // Parse timeSlots if it's a string
      let parsedTimeSlots = [];
      if (needTimeSlots && timeSlots) {
        parsedTimeSlots =
          typeof timeSlots === "string" ? JSON.parse(timeSlots) : timeSlots;
      }

      // Create new service object
      const newService = {
        name,
        description: description || "",
        price,
        outlet: outlet || "",
        images: uploadedImageKeys,
        autoConfirmation:
          autoConfirmation === "true" || autoConfirmation === true,
        needTimeSlots: needTimeSlots === "true" || needTimeSlots === true,
        timeSlots: parsedTimeSlots,
      };

      // Find or create reservation setting for store
      let reservationSetting = await ReservationSetting.findOne({
        store: storeID,
      });

      if (!reservationSetting) {
        reservationSetting = new ReservationSetting({
          store: storeID,
          services: [newService],
        });
      } else {
        reservationSetting.services.push(newService);
      }

      await reservationSetting.save();

      // Get the newly created service
      const createdService =
        reservationSetting.services[reservationSetting.services.length - 1];

      return res.status(201).json({
        success: true,
        message: "Service created successfully",
      });
    } catch (error) {
      console.error("Error in createService:", error);

      // Clean up uploaded images on error
      if (uploadedImageKeys.length > 0) {
        for (const key of uploadedImageKeys) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: "samparka",
                Key: key,
              })
            );
          } catch (deleteError) {
            console.error("Error deleting image:", deleteError);
          }
        }
      }

      return res.status(500).json({
        success: false,
        message: "Failed to create service",
      });
    }
  }

  // Update service
  async updateService(req, res) {
    const uploadedImageKeys = [];

    try {
      const { storeID, serviceID } = req.params;
      const {
        name,
        description,
        price,
        outlet,
        autoConfirmation,
        needTimeSlots,
        timeSlots,
        existingImages, // JSON array of image keys to keep
        deletedImages, // JSON array of image keys to delete
      } = req.body;

      const files = req.files || [];

      const reservationSetting = await ReservationSetting.findOne({
        store: storeID,
      });

      if (!reservationSetting) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      const service = reservationSetting.services.id(serviceID);

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        });
      }

      const currentImages = service.images || [];
      let finalImageKeys = [];

      // Parse existing images to keep
      if (existingImages) {
        const keepImages =
          typeof existingImages === "string"
            ? JSON.parse(existingImages)
            : existingImages;

        // Extract keys from URLs if full URLs are provided
        finalImageKeys = keepImages.map((img) => {
          // If it's a signed URL, extract just the key (before query parameters)
          if (img.includes("samparka") && img.includes("http")) {
            const urlParts = img.split("/samparka/")[1];
            if (urlParts) {
              // Remove query parameters if present
              return urlParts.split("?")[0];
            }
          }
          // If it's already a key, return as is
          return img;
        });
      }

      // Delete specified images from S3
      if (deletedImages) {
        const imagesToDelete =
          typeof deletedImages === "string"
            ? JSON.parse(deletedImages)
            : deletedImages;

        for (const imageKey of imagesToDelete) {
          // Extract key from full URL if provided (remove query parameters)
          let key = imageKey;
          if (imageKey.includes("samparka") && imageKey.includes("http")) {
            const urlParts = imageKey.split("/samparka/")[1];
            if (urlParts) {
              key = urlParts.split("?")[0];
            }
          }

          if (currentImages.includes(key)) {
            try {
              await s3.send(
                new DeleteObjectCommand({
                  Bucket: "samparka",
                  Key: key,
                })
              );
            } catch (deleteError) {
              console.error("Error deleting image from S3:", deleteError);
            }
          }
        }
      }

      // Upload new images
      for (const file of files) {
        const imageKey = `${Date.now()}-${file.originalname}`;
        const uploadParams = {
          Bucket: "samparka",
          Key: imageKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        await s3.send(new PutObjectCommand(uploadParams));
        uploadedImageKeys.push(imageKey);
        finalImageKeys.push(imageKey);
      }

      // Parse timeSlots if it's a string
      let parsedTimeSlots = [];
      if (timeSlots) {
        parsedTimeSlots =
          typeof timeSlots === "string" ? JSON.parse(timeSlots) : timeSlots;
      }

      // Update service fields
      service.name = name;
      service.description = description || "";
      service.price = price;
      service.outlet = outlet || "";
      service.images = finalImageKeys;
      service.autoConfirmation =
        autoConfirmation === "true" || autoConfirmation === true;
      service.needTimeSlots =
        needTimeSlots === "true" || needTimeSlots === true;
      service.timeSlots = parsedTimeSlots;

      await reservationSetting.save();

      return res.status(200).json({
        success: true,
        message: "Service updated successfully",
        data: {
          ...service.toObject(),
          images: service.images.map(
            (key) => `https://samparka.s3.amazonaws.com/${key}`
          ),
        },
      });
    } catch (error) {
      console.error("Error in updateService:", error);

      // Clean up newly uploaded images on error
      if (uploadedImageKeys.length > 0) {
        for (const key of uploadedImageKeys) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: "samparka",
                Key: key,
              })
            );
          } catch (deleteError) {
            console.error("Error deleting image:", deleteError);
          }
        }
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update service",
      });
    }
  }

  // Delete service
  async deleteService(req, res) {
    try {
      const { storeID, serviceID } = req.params;

      const reservationSetting = await ReservationSetting.findOne({
        store: storeID,
      });

      if (!reservationSetting) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      const service = reservationSetting.services.id(serviceID);

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        });
      }

      const images = service.images || [];

      // Remove service from array
      service.deleteOne();
      await reservationSetting.save();

      // Delete images from S3
      for (const imageKey of images) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: "samparka",
              Key: imageKey,
            })
          );
        } catch (deleteError) {
          console.error("Error deleting image from S3:", deleteError);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Service deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteService:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete service",
      });
    }
  }
}

module.exports = new ReservationServiceController();
