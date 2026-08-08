const cloudinary = require("cloudinary").v2;
const fs = require("fs");
require("dotenv").config();

// Configure Cloudinary with user-provided API credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "bbdmypjc";
const apiKey = process.env.CLOUDINARY_API_KEY || "431786926569597";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "lkorc2Qu8DTpwrKlOrEKI5_CQFo";

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Upload local file or buffer to Cloudinary
 * @param {string} filePath - Absolute or relative path to local image file
 * @param {string} folder - Destination folder in Cloudinary
 */
const uploadToCloudinary = async (filePath, folder = "tinytots/products") => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return null;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return {
      success: true,
      url: result.secure_url || result.url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.warn("⚠️ Cloudinary upload note:", error.message || error);
    return null;
  }
};

/**
 * Fetch/search images from Cloudinary library
 */
const fetchCloudinaryLibrary = async (maxResults = 20) => {
  try {
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: "tinytots",
      max_results: maxResults,
    });
    return res.resources.map((r) => ({
      publicId: r.public_id,
      url: r.secure_url,
      format: r.format,
      bytes: r.bytes,
      createdAt: r.created_at,
    }));
  } catch (error) {
    return [];
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  fetchCloudinaryLibrary,
};
