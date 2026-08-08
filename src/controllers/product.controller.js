const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");

exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search, isDealOfDay } = req.query;
    const where = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { specifications: { contains: search } },
      ];
    }

    if (isDealOfDay === "true") {
      where.isDealOfDay = true;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { rating: "desc" },
    });

    return successResponse(res, products, "Products fetched successfully.");
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { categoryRel: true },
    });

    if (!product) {
      return errorResponse(res, "Product not found.", 404);
    }
    return successResponse(res, product, "Product details fetched successfully.");
  } catch (error) {
    next(error);
  }
};

exports.getDealsOfTheDay = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isDealOfDay: true },
    });
    return successResponse(res, products, "Deals of the day fetched successfully.");
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      rating,
      reviewsCount,
      discount,
      ageGroup,
      isDealOfDay,
      freeDelivery,
      specifications,
    } = req.body;

    let imageUrl = req.body.imageUrl || "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80";

    // If uploaded via multipart
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    // If base64 data URL is sent, save it as a file on the FTP server
    else if (imageUrl.startsWith("data:image/")) {
      const fs = require("fs");
      const path = require("path");
      const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
        const base64Data = matches[2];
        const filename = `prod-img-${Date.now()}.${ext}`;
        const uploadDir = path.join(__dirname, "../../uploads");
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(path.join(uploadDir, filename), base64Data, "base64");
        imageUrl = `/uploads/${filename}`;
      }
    }

    const id = req.body.id || "prod-" + Date.now();


    const product = await prisma.product.upsert({
      where: { id },
      update: {
        name: name || "Kids Fashion Item",
        category: category || "girls",
        price: parseFloat(price) || 499,
        originalPrice: parseFloat(originalPrice || price) || 999,
        rating: rating ? parseFloat(rating) : 4.8,
        reviewsCount: reviewsCount ? parseInt(reviewsCount) : 100,
        imageUrl,
        discount: discount || "50% OFF",
        ageGroup: ageGroup || "2-5 Yrs",
        isDealOfDay: isDealOfDay === "true" || isDealOfDay === true,
        freeDelivery: freeDelivery !== "false" && freeDelivery !== false,
        specifications: specifications || "",
      },
      create: {
        id,
        name: name || "Kids Fashion Item",
        category: category || "girls",
        price: parseFloat(price) || 499,
        originalPrice: parseFloat(originalPrice || price) || 999,
        rating: rating ? parseFloat(rating) : 4.8,
        reviewsCount: reviewsCount ? parseInt(reviewsCount) : 100,
        imageUrl,
        discount: discount || "50% OFF",
        ageGroup: ageGroup || "2-5 Yrs",
        isDealOfDay: isDealOfDay === "true" || isDealOfDay === true,
        freeDelivery: freeDelivery !== "false" && freeDelivery !== false,
        specifications: specifications || "",
      },
    });

    return successResponse(res, product, "Product created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      price,
      originalPrice,
      rating,
      reviewsCount,
      discount,
      ageGroup,
      isDealOfDay,
      freeDelivery,
      specifications,
      imageUrl: bodyImageUrl,
    } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (category !== undefined) data.category = category;
    if (price !== undefined) data.price = parseFloat(price);
    if (originalPrice !== undefined) data.originalPrice = parseFloat(originalPrice);
    if (rating !== undefined) data.rating = parseFloat(rating);
    if (reviewsCount !== undefined) data.reviewsCount = parseInt(reviewsCount);
    if (discount !== undefined) data.discount = discount;
    if (ageGroup !== undefined) data.ageGroup = ageGroup;
    if (isDealOfDay !== undefined) data.isDealOfDay = isDealOfDay === "true" || isDealOfDay === true;
    if (freeDelivery !== undefined) data.freeDelivery = freeDelivery !== "false" && freeDelivery !== false;
    if (specifications !== undefined) data.specifications = specifications;
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    } else if (bodyImageUrl) {
      // If base64 data URL, save as file on FTP server
      if (bodyImageUrl.startsWith("data:image/")) {
        const fs = require("fs");
        const path = require("path");
        const matches = bodyImageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
          const base64Data = matches[2];
          const filename = `prod-img-${Date.now()}.${ext}`;
          const uploadDir = path.join(__dirname, "../../uploads");
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          fs.writeFileSync(path.join(uploadDir, filename), base64Data, "base64");
          data.imageUrl = `/uploads/${filename}`;
        }
      } else {
        data.imageUrl = bodyImageUrl;
      }
    }


    const updatedProduct = await prisma.product.upsert({
      where: { id },
      update: data,
      create: {
        id,
        name: name || "Kids Fashion Item",
        category: category || "girls",
        price: parseFloat(price) || 499,
        originalPrice: parseFloat(originalPrice || price) || 999,
        rating: rating ? parseFloat(rating) : 4.8,
        reviewsCount: reviewsCount ? parseInt(reviewsCount) : 100,
        imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80",
        discount: discount || "50% OFF",
        ageGroup: ageGroup || "2-5 Yrs",
        isDealOfDay: isDealOfDay === "true" || isDealOfDay === true,
        freeDelivery: freeDelivery !== "false" && freeDelivery !== false,
        specifications: specifications || "",
      },
    });

    return successResponse(res, updatedProduct, "Product updated successfully.");
  } catch (error) {
    next(error);
  }
};


exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return successResponse(res, { id }, "Product deleted successfully.");
  } catch (error) {
    next(error);
  }
};

