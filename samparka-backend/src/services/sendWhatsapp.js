const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const stream = require("stream");
const WhatsappAccount = require("../models/whatsappAccountModel");
const WhatsappMedia = require("../models/WhatsappMedia");
const s3 = require("../config/s3Config"); // your AWS SDK wrapper
const { PutObjectCommand } = require("@aws-sdk/client-s3");

/**
 * 1. Upload image to AWS S3
 */
async function uploadToS3(file) {
  const newImageName = Date.now().toString() + "-" + file.originalname;
  const putObjectParams = {
    Bucket: "samparka",
    Key: newImageName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(putObjectParams));

  return newImageName;
}

/**
 * 2. Upload to WhatsApp Media API → get mediaId
 */
async function uploadToWhatsappMedia(storeId, file) {
  const wa = await WhatsappAccount.findOne({ storeId, isActive: true });
  if (!wa) throw new Error("WhatsApp account not found");

  // const form = new FormData();
  // form.append("messaging_product", "whatsapp");
  // form.append("file", fs.createReadStream(file.path));

  // Convert buffer → stream (WhatsApp requires file stream)
  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", bufferStream, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const response = await axios.post(
    `https://graph.facebook.com/v22.0/${wa.phoneNumberId}/media`,
    form,
    {
      headers: {
        Authorization: `Bearer ${wa.accessToken}`,
        ...form.getHeaders(),
      },
    }
  );

  return response.data.id; // mediaId
}

/**
 * 3. Save media record to DB (S3 + WA media)
 */
async function saveMediaRecord(storeId, mediaId, imageName) {
  const record = new WhatsappMedia({
    storeId,
    mediaId,
    fileName: imageName,
  });

  return record.save();
}

/**
 * 4. Upload handling (S3 + WA)
 */
async function uploadMedia(storeId, file) {
  const imageName = await uploadToS3(file);
  const mediaId = await uploadToWhatsappMedia(storeId, file);

  await saveMediaRecord(storeId, mediaId, imageName);

  return { mediaId, imageName };
}

/**
 * 5. Send WhatsApp template message
 */
async function sendWhatsappMessage({
  storeId,
  to,
  templateName,
  language = "en",
  components = [],
}) {
  const wa = await WhatsappAccount.findOne({ storeId, isActive: true });
  if (!wa) throw new Error("No WhatsApp account found");

  const url = `https://graph.facebook.com/v22.0/${wa.phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
      components,
    },
  };

  const headers = {
    Authorization: `Bearer ${wa.accessToken}`,
    "Content-Type": "application/json",
  };

  const response = await axios.post(url, payload, { headers });
  return response.data;
}

module.exports = {
  sendWhatsappMessage,
  uploadMedia,
};
