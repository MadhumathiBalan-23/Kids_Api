const prisma = require("../config/db");
const { successResponse } = require("../utils/apiResponse");

exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: "asc" },
    });
    return successResponse(res, banners, "Banners fetched successfully.");
  } catch (error) {
    next(error);
  }
};

exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, tag, code, bgColor, iconName } = req.body;
    const bannerImageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.bannerImageUrl;
    const id = req.body.id || "b" + Date.now();

    const banner = await prisma.banner.create({
      data: {
        id,
        title,
        subtitle: subtitle || null,
        tag: tag || null,
        code: code || null,
        bannerImageUrl,
        bgColor: bgColor || "#FF6B8B",
        iconName: iconName || "sparkles",
      },
    });

    return successResponse(res, banner, "Banner created successfully.", 201);
  } catch (error) {
    next(error);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subtitle, tag, code, bgColor, iconName, bannerImageUrl } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (subtitle !== undefined) data.subtitle = subtitle;
    if (tag !== undefined) data.tag = tag;
    if (code !== undefined) data.code = code;
    if (bgColor !== undefined) data.bgColor = bgColor;
    if (iconName !== undefined) data.iconName = iconName;
    if (req.file) {
      data.bannerImageUrl = `/uploads/${req.file.filename}`;
    } else if (bannerImageUrl) {
      data.bannerImageUrl = bannerImageUrl;
    }

    const updatedBanner = await prisma.banner.upsert({
      where: { id },
      update: data,
      create: {
        id,
        title: title || "Exclusive Festival Offer",
        subtitle: subtitle || "Special Discounts on Kids Collection",
        tag: tag || "FLAT 50% OFF",
        code: code || "KIDS50",
        bannerImageUrl: data.bannerImageUrl || null,
        bgColor: bgColor || "#FF6B8B",
        iconName: iconName || "sparkles",
      },
    });

    return successResponse(res, updatedBanner, "Banner updated successfully.");

  } catch (error) {
    next(error);
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    return successResponse(res, { id }, "Banner deleted successfully.");
  } catch (error) {
    next(error);
  }
};

