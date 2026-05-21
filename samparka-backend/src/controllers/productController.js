// import categoryModel from "../models/categoryModel.js";
// import storeModel from "../models/storeModel.js";
// import productModel from "../models/productModel.js";
// import { fileURLToPath } from "url";
// import { dirname, join } from "path";
// import fs from "fs";

// import path from "path";
// import { DeleteObjectCommand } from "@aws-sdk/client-s3";
// import {
//   PutObjectCommand,
//   GetObjectCommand,
//   S3Client,
// } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import mongoose from "mongoose";

const categoryModel = require("../models/categoryModel");
const storeModel = require("../models/storeModel");
const productModel = require("../models/productModel");
const { fileURLToPath } = require("url");
const { dirname, join } = require("path");
const fs = require("fs");
const path = require("path");
const {
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const mongoose = require("mongoose");
const s3 = require("../config/s3Config.js");

function transformSpecificity(input) {
  const result = {};

  for (const item of input) {
    const innerMap = {};

    for (const pair of item.keyValuePairs) {
      innerMap[pair.key] = pair.value;
    }

    result[item.mainField] = innerMap;
  }

  return result;
}

class ProductController {
  async addProduct(req, res) {
    const {
      name,
      price,
      description,
      discountRate,
      category,
      calculatedPrice,
      specificity,
    } = req.body;
    const trackStock = req.body.trackStock === "true" ? true : false;
    const stock = req.body.stock === "" ? null : parseInt(req.body.stock);
    const { storeId } = req.params;

    // Check if files are provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    try {
      // Input validation
      if (!name || !price || !description || !category || !storeId) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      if (discountRate > 100 || discountRate < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid Discount Rate",
        });
      }

      // Check if the store and category exist and match
      const storeCategories = await categoryModel.findOne({ store: storeId });

      if (!storeCategories) {
        return res.status(404).json({
          success: false,
          message: "Store or categories not found",
        });
      }

      // Validate if the category exists in the store's categories
      if (!storeCategories.name.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Available categories: ${storeCategories.name.join(
            ", "
          )}`,
        });
      }

      // Array to store image names
      const imageNames = [];

      // Loop through each file and upload to S3
      for (const file of req.files) {
        const imageName = Date.now().toString() + "-" + file.originalname;
        imageNames.push(imageName);

        const putObjectParams = {
          Bucket: "samparka",
          Key: imageName,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const putCommand = new PutObjectCommand(putObjectParams);
        await s3.send(putCommand);
      }

      const rawSpecificity = JSON.parse(specificity);
      const transformedSpecificity = transformSpecificity(rawSpecificity);

      // Prepare product data
      const productData = {
        name,
        price,
        description,
        discountRate: discountRate || 0, // Default to 0 if not provided
        images: imageNames, // Array of image names
        category, // Reference the Category document
        storeId,
        calculatedPrice,
        trackStock,
        stock,
        specificity: transformedSpecificity || {}, // Ensure specificity is included, default to an empty object if not provided
      };

      // Create the product in the database
      const product = await productModel.create(productData);

      // Respond with success
      return res.status(201).json({
        success: true,
        message: "Product added successfully",
        product,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to add product",
        error: error.message || error,
      });
    }
  }

  async addCategory(req, res) {
    const { categoryName } = req.body; // categoryName is the new name to add
    const { storeId } = req.params; // storeId identifies the store

    try {
      // Find if a category document exists for the given store
      let category = await categoryModel.findOne({ store: storeId });

      if (category) {
        // Check if the categoryName already exists in the name array
        if (!category.name.includes(categoryName)) {
          // Add the new categoryName to the array
          category.name.push(categoryName);
          await category.save();
        }
        return res.status(200).json({
          success: true,
          message: "Category updated successfully",
          category,
        });
      } else {
        // Create a new category document
        category = await categoryModel.create({
          name: [categoryName], // Initialize with the new categoryName
          store: storeId,
        });
        return res.status(201).json({
          success: true,
          message: "Category created successfully",
          category,
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      return res.status(400).json({
        success: false,
        message: "Failed to add category",
        error: error.message,
      });
    }
  }
  async getProduct(req, res) {
    const { storeId } = req.params;
    try {
      const checkStore = await storeModel.findOne({ _id: storeId });
      if (checkStore) {
        // Use the storeId to fetch the products

        try {
          const products = await productModel.find({ storeId });

          // Map through the products and generate signed URLs for images
          for (const product of products) {
            const imageUrls = await Promise.all(
              product.images.map(async (image) => {
                const getObjectParams = {
                  Bucket: "samparka",
                  Key: image, // Assuming image is the name of the file in S3
                };
                const command = new GetObjectCommand(getObjectParams);
                return await getSignedUrl(s3, command, {
                  expiresIn: 3600 * 60,
                });
              })
            );

            // Replace the images array with the generated URLs
            product.images = imageUrls;
          }

          if (!products || products.length === 0) {
            return res.json({ success: false, message: "No products found" });
          }
          return res.json({ success: true, products });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Server Error" });
        }
      } else {
        return res.status(404).json({ message: "Store not found" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Server Error" });
    }
  }

  async getSingleProduct(req, res) {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId format" });
    }

    try {
      // Fetch the single product based on the productId
      const product = await productModel.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Map through the images array and generate a signed URL for each image
      const imageUrls = await Promise.all(
        product.images.map(async (image) => {
          const getObjectParams = {
            Bucket: "samparka",
            Key: image, // Assuming image is the name of the file in S3
          };
          const command = new GetObjectCommand(getObjectParams);
          return await getSignedUrl(s3, command, { expiresIn: 3600 });
        })
      );

      // Replace the images array with the generated URLs
      product.images = imageUrls;

      return res.status(200).json(product);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server Error" });
    }
  }

  async getCategory(req, res) {
    const { storeId } = req.params;
    try {
      const category = await categoryModel.find({ store: storeId });
      if (!category) {
        return res
          .status(404)
          .json({ message: "No Categories in the store yet" });
      }
      return res.status(200).json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server Error" });
    }
  }

  async editProduct(req, res) {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discountRate,
      category,
      removedImages,
      calculatedPrice,
    } = req.body;
    // const __filename = fileURLToPath(import.meta.url);
    // const __dirname = dirname(__filename);
    console.log(removedImages);
    const trackStock = req.body.trackStock === "true" ? true : false;
    const stock = req.body.stock === "" ? null : parseInt(req.body.stock);
    const removedImagesArray = JSON.parse(removedImages);
    console.log("Req body ", req.body);

    if (discountRate > 100 || discountRate < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Discount Rate",
      });
    }

    function getImageNameFromS3Url(url) {
      const s3Url = new URL(url);
      return s3Url.pathname.substring(1);
    }

    const imageNames = removedImagesArray.map((url) =>
      getImageNameFromS3Url(url)
    );

    // Decode the URL-encoded image names
    const decodedImageNames = imageNames.map(
      (name) => decodeURIComponent(name.replace(/^samparka\//, "")) // Remove "samparka/"
    );

    console.log("Decoded Image Names: ", decodedImageNames);

    try {
      let product = await productModel.findById(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      let updatedImages = product.images || [];
      console.log("Req File, ", req.file);
      console.log("Req Files, ", req.files);

      // Check if new images are uploaded
      if (req.files && req.files.length > 0) {
        console.log("New images received:", req.files.length);

        // Upload new images to S3 and append to the existing array
        for (const file of req.files) {
          const imageName = Date.now().toString() + "-" + file.originalname;
          const putObjectParams = {
            Bucket: "samparka",
            Key: imageName,
            Body: file.buffer,
            ContentType: file.mimetype,
          };

          const putCommand = new PutObjectCommand(putObjectParams);
          await s3.send(putCommand);
          updatedImages.push(imageName); // Append to the images array
        }
      }

      // Delete images from S3
      for (const img of decodedImageNames) {
        const deleteParams = {
          Bucket: "samparka",
          Key: img, // Ensure `img` is the S3 key, not URL
        };
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);

        // Remove the image reference from MongoDB
        updatedImages = updatedImages.filter((image) => image !== img);
      }

      console.log("updated images, ", updatedImages);
      // Update the product with new data
      const updatedProduct = await productModel.findByIdAndUpdate(
        id,
        {
          name,
          price,
          description,
          discountRate: discountRate || 0,
          images: updatedImages,
          category,
          calculatedPrice,
          stock,
          trackStock,
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update product",
        error: error.message || error,
      });
    }
  }

  async deleteProduct(req, res) {
    const { id } = req.params;

    try {
      // Find product by ID
      const product = await productModel.findById(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      // Extract image keys (assuming images are stored as S3 URLs)
      const imageKeys = product.images.map((imgUrl) => {
        const urlParts = imgUrl.split("/");
        return urlParts[urlParts.length - 1]; // Extracts only the filename/key
      });

      // Delete images from S3
      for (const imgKey of imageKeys) {
        const deleteParams = {
          Bucket: "samparka",
          Key: imgKey,
        };
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);
      }

      // Delete product from database
      await productModel.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Product and images deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  async productCount(req, res) {
    try {
      const { storeId } = req.params;

      // Fetch all categories for the store
      const categories = await categoryModel.find({ store: storeId });

      if (!categories.length) {
        return res.json([]);
      }

      let categoryProductCounts = [];

      for (const category of categories) {
        for (const categoryName of category.name) {
          const productCount = await productModel.countDocuments({
            category: categoryName, // Match exact category name
            storeId: storeId,
          });

          categoryProductCounts.push({
            categoryName,
            noOfProducts: productCount,
          });
        }
      }

      res.json(categoryProductCounts);
    } catch (error) {
      console.error("Error fetching category product counts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async editCategory(req, res) {
    try {
      const { storeId } = req.params;
      const { newCategoryName, oldCategoryName } = req.body;

      const categoryDoc = await categoryModel.findOne({ store: storeId });

      if (!categoryDoc) {
        return res.status(404).json({
          success: false,
          message: "Category Dcoument not found",
        });
      }

      const categoryIndex = categoryDoc.name.indexOf(oldCategoryName);

      if (categoryIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Category not found in this store",
        });
      }
      categoryDoc.name[categoryIndex] = newCategoryName;

      await categoryDoc.save();

      await productModel.updateMany(
        {
          category: oldCategoryName,
          storeId: storeId,
        },
        { category: newCategoryName }
      );

      return res.status(200).json({
        status: true,
        message: "Category Name updated Succesfully",
      });
    } catch (error) {
      console.error("Error updating category: ", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { storeId } = req.params;
      const { categoryName } = req.body;
      console.log(req.body);
      console.log(categoryName);

      // Find the category document for the store
      const categoryDoc = await categoryModel.findOne({ store: storeId });

      // If the category document is not found, return an error
      if (!categoryDoc) {
        return res.status(404).json({
          success: false,
          message: "Category document not found",
        });
      }

      // Find the index of the categoryName to be deleted in the 'name' array
      const categoryIndex = categoryDoc.name.indexOf(categoryName);

      // If the category is not found in the array, return an error
      if (categoryIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Category not found in this store",
        });
      }

      // Remove the categoryName from the 'name' array
      categoryDoc.name.splice(categoryIndex, 1);

      // Save the updated category document
      await categoryDoc.save();

      // Now update all products to set the 'category' field to an empty string for the deleted category
      await productModel.updateMany(
        { category: categoryName, storeId: storeId },
        { $set: { category: "" } }
      );

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete category",
      });
    }
  }
}

module.exports = new ProductController();
