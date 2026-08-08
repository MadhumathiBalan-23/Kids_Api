const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/banner.controller");
const upload = require("../middleware/upload");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", bannerController.getAllBanners);
router.post("/", upload.single("bannerImage"), bannerController.createBanner);
router.put("/:id", upload.single("bannerImage"), bannerController.updateBanner);
router.patch("/:id", upload.single("bannerImage"), bannerController.updateBanner);
router.delete("/:id", bannerController.deleteBanner);


module.exports = router;

