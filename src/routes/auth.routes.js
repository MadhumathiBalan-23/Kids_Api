const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.get("/me", authenticate, authController.getMe);

module.exports = router;

