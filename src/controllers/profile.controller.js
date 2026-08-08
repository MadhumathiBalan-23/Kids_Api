const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        pincode: true,
        phone: true,
        avatar: true,
        role: true,
        sparksBalance: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, "Profile not found.", 404);
    }
    return successResponse(res, user, "User profile fetched successfully.");
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, pincode, phone } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : req.body.avatar;

    const data = {};
    if (name) data.name = name;
    if (pincode) data.pincode = pincode;
    if (phone) data.phone = phone;
    if (avatar) data.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        pincode: true,
        phone: true,
        avatar: true,
        role: true,
        sparksBalance: true,
        createdAt: true,
      },
    });

    return successResponse(res, updatedUser, "Profile updated successfully.");
  } catch (error) {
    next(error);
  }
};

exports.getSparksRewards = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { sparksBalance: true },
    });

    return successResponse(
      res,
      {
        sparksBalance: user ? user.sparksBalance : 680,
        multiplier: "2X on Kids Fest",
        tier: "TinyTots VIP Member",
      },
      "Sparks balance fetched successfully."
    );
  } catch (error) {
    next(error);
  }
};
