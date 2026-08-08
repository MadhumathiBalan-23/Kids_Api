const path = require("path");
const fs = require("fs");
const { uploadToCloudinary, fetchCloudinaryLibrary } = require("../services/cloudinary.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Curated high-res Kids Mart image assets for instant catalog preview
const CURATED_KIDS_ASSETS = [
  {
    title: "Girls Party Frock & Princess Wear",
    category: "girls",
    url: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&auto=format&fit=crop&q=80",
    tags: ["Party Wear", "Girls", "Frock"],
  },
  {
    title: "Boys Gentleman Tuxedo Suit Set",
    category: "boys",
    url: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&auto=format&fit=crop&q=80",
    tags: ["Tuxedo", "Boys", "Blazer"],
  },
  {
    title: "Organic Cotton Newborn Baby Rompers",
    category: "infants",
    url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    tags: ["Infants", "Romper", "Organic"],
  },
  {
    title: "Kids Light-Up LED Sport Sneakers",
    category: "footwear",
    url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&auto=format&fit=crop&q=80",
    tags: ["Footwear", "Shoes", "Sneakers"],
  },
  {
    title: "Montessori Wooden Educational Toys",
    category: "toys",
    url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80",
    tags: ["Learning", "Wooden", "Toys"],
  },
  {
    title: "Gentle Calendula Baby Care Set",
    category: "care",
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    tags: ["Baby Care", "Skin", "Lotion"],
  },
];

/**
 * Handle direct file & base64 image upload to Server FTP / Static Storage
 */
exports.uploadImage = async (req, res, next) => {
  try {
    let imageUrl = null;
    let filename = null;
    let fileSize = 0;
    let cloudinaryData = null;

    // 1. Multipart Form-Data upload
    if (req.file) {
      filename = req.file.filename;
      fileSize = req.file.size;
      imageUrl = `http://localhost:5001/uploads/${filename}`;

      // Upload & Mirror to Cloudinary
      try {
        const cloudRes = await uploadToCloudinary(req.file.path, "tinytots/products");
        if (cloudRes && cloudRes.url) {
          cloudinaryData = cloudRes;
          imageUrl = cloudRes.url; // Use Cloudinary CDN URL directly!
        }
      } catch (e) {
        // Cloudinary mirror optional fallback
      }
    }
    // 2. Base64 Image upload directly to FTP /uploads folder
    else if (req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const ext = req.body.ext || "jpg";
      filename = `ftp-img-${Date.now()}.${ext}`;
      const destPath = path.join(uploadDir, filename);

      fs.writeFileSync(destPath, base64Data, "base64");
      fileSize = fs.statSync(destPath).size;
      imageUrl = `http://localhost:5001/uploads/${filename}`;

      try {
        const cloudRes = await uploadToCloudinary(destPath, "tinytots/products");
        if (cloudRes && cloudRes.url) {
          cloudinaryData = cloudRes;
          imageUrl = cloudRes.url; // Use Cloudinary CDN URL directly!
        }
      } catch (e) {}
    }
    // 3. Direct URL provided
    else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    if (!imageUrl) {
      return errorResponse(res, "No image file, Base64 data, or URL provided.", 400);
    }

    return successResponse(
      res,
      {
        imageUrl,
        filename,
        size: fileSize,
        storageType: "Server FTP & CDN",
        cloudinary: cloudinaryData,
      },
      "Image uploaded and stored on server successfully."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Server FTP Storage Files & Cloudinary Library
 */
exports.getImageLibrary = async (req, res, next) => {
  try {
    // Read files currently stored in /uploads
    const serverFiles = [];
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach((f) => {
        const filePath = path.join(uploadDir, f);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          serverFiles.push({
            title: `Server FTP File: ${f}`,
            category: "uploads",
            url: `http://localhost:5001/uploads/${f}`,
            size: stats.size,
            tags: ["Server FTP", "Local File"],
            createdAt: stats.mtime,
          });
        }
      });
    }

    // Try Cloudinary
    let cloudAssets = [];
    try {
      cloudAssets = await fetchCloudinaryLibrary(10);
    } catch (e) {}

    const combined = [
      ...serverFiles,
      ...CURATED_KIDS_ASSETS,
      ...cloudAssets.map((c) => ({
        title: "Cloudinary CDN Asset",
        category: "cloudinary",
        url: c.url,
        tags: ["Cloudinary", "CDN"],
      })),
    ];

    return successResponse(
      res,
      {
        assets: combined,
        serverStoragePath: "/uploads",
        totalFilesOnServer: serverFiles.length,
        cloudinaryApiKey: "431786926569597",
      },
      "FTP server assets and image library fetched successfully."
    );
  } catch (error) {
    next(error);
  }
};
