const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { optionalAuth, authenticate, authorize } = require("../middleware/auth");

router.get("/", orderController.getAllOrders);
router.post("/", optionalAuth, orderController.placeOrder);
router.get("/my-orders", authenticate, orderController.getMyOrders);
router.get("/:id", optionalAuth, orderController.getOrderById);

router.patch("/:id/status", orderController.updateOrderStatus);
router.put("/:id", orderController.updateOrder);
router.patch("/:id", orderController.updateOrder);
router.delete("/:id", orderController.deleteOrder);

module.exports = router;

