const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { optionalAuth, authenticate } = require("../middleware/auth");

router.get("/", optionalAuth, notificationController.getNotifications);
router.patch("/:id/read", authenticate, notificationController.markAsRead);

module.exports = router;
