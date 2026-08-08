const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller");
const upload = require("../middleware/upload");

router.post("/", upload.single("image"), uploadController.uploadImage);
router.post("/cloudinary", upload.single("image"), uploadController.uploadImage);
router.get("/library", uploadController.getImageLibrary);

module.exports = router;
