const prisma = require("../config/db");
const { successResponse } = require("../utils/apiResponse");

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const where = userId
      ? { OR: [{ userId }, { userId: null }] }
      : {};

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, notifications, "Notifications fetched successfully.");
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true },
    });
    return successResponse(res, notification, "Notification marked as read.");
  } catch (error) {
    next(error);
  }
};
