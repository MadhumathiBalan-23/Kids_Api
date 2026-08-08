const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { optionalAuth, authenticate } = require("../middleware/auth");

router.post("/calculate", cartController.calculateCart);
router.get("/", optionalAuth, cartController.getCart);
router.put("/", optionalAuth, cartController.updateCart);
router.delete("/", optionalAuth, cartController.clearCart);

module.exports = router;
