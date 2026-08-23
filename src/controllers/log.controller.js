const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeLog, writePaymentLog } = require("../utils/logger");


// ─── GET /api/logs  — All activity logs (Admin) ────────────────────────────────
exports.getLogs = async (req, res, next) => {
  try {
    const { category, type, limit = 100 } = req.query;

    let sql = `SELECT * FROM ActivityLog`;
    const params = [];
    const conditions = [];

    if (category) { conditions.push(`category = ?`); params.push(category); }
    if (type)     { conditions.push(`type = ?`);     params.push(type); }
    if (conditions.length) sql += ` WHERE ` + conditions.join(" AND ");
    sql += ` ORDER BY createdAt DESC LIMIT ?`;
    params.push(Number(limit));

    const logs = await prisma.$queryRawUnsafe(sql, ...params);
    return successResponse(res, logs, "Activity logs fetched.");
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/logs/payments  — All payment logs (Admin) ────────────────────────
exports.getPaymentLogs = async (req, res, next) => {
  try {
    const logs = await prisma.$queryRawUnsafe(
      `SELECT * FROM PaymentLog ORDER BY createdAt DESC LIMIT 200`
    );
    return successResponse(res, logs, "Payment logs fetched.");
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/logs  — Clear all logs ────────────────────────────────────────
exports.clearLogs = async (req, res, next) => {
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM ActivityLog`);
    return successResponse(res, {}, "All logs cleared.");
  } catch (error) {
    next(error);
  }
};

// Export helpers for use in other controllers
module.exports = {
  getLogs: exports.getLogs,
  getPaymentLogs: exports.getPaymentLogs,
  clearLogs: exports.clearLogs,
  writeLog,
  writePaymentLog,
};
