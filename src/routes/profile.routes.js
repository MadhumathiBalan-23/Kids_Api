const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const upload = require("../middleware/upload");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, profileController.getProfile);
router.put("/", authenticate, upload.single("avatar"), profileController.updateProfile);
router.get("/sparks", authenticate, profileController.getSparksRewards);

module.exports = router;
