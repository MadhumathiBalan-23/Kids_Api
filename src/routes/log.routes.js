const express = require("express");
const router = express.Router();
const logController = require("../controllers/log.controller");

// GET /api/logs            - All activity logs
router.get("/", logController.getLogs);

// GET /api/logs/payments   - All payment logs
router.get("/payments", logController.getPaymentLogs);

// DELETE /api/logs         - Clear all activity logs
router.delete("/", logController.clearLogs);

module.exports = router;
