const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const upload = require("../middleware/upload");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", productController.getAllProducts);
router.get("/deals-of-the-day", productController.getDealsOfTheDay);
router.post("/", upload.single("image"), productController.createProduct);
router.put("/:id", upload.single("image"), productController.updateProduct);
router.patch("/:id", upload.single("image"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);


module.exports = router;

