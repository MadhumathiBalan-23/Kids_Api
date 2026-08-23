// Standalone DB logger — uses Prisma $executeRawUnsafe to write activity/payment logs
// Import this utility in any controller: const { writeLog, writePaymentLog } = require('../utils/logger');
const prisma = require("../config/db");

/**
 * Write an activity log entry to the ActivityLog table
 */
const writeLog = async ({
  type = "INFO",
  action,
  category = "system",
  details,
  actor = "System",
  userId = null,
  orderId = null,
  ipAddress = null,
}) => {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO ActivityLog (type, action, category, details, actor, userId, orderId, ipAddress, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      String(type),
      String(action),
      String(category),
      String(details),
      String(actor),
      userId !== undefined ? userId : null,
      orderId !== undefined ? orderId : null,
      ipAddress !== undefined ? ipAddress : null
    );
  } catch (err) {
    // Silently fail — don't break the main request if logging fails
    // Table may not exist yet (first boot before migration runs)
    if (!err.message?.includes("no such table")) {
      console.warn("⚠️  ActivityLog write failed:", err.message);
    }
  }
};

/**
 * Write a payment log entry to the PaymentLog table
 */
const writePaymentLog = async ({
  orderId,
  userId = null,
  customerName,
  amount,
  paymentMethod,
  status = "Success",
  transactionId = null,
  notes = null,
}) => {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO PaymentLog (orderId, userId, customerName, amount, paymentMethod, status, transactionId, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      String(orderId),
      userId !== undefined ? userId : null,
      String(customerName),
      Number(amount),
      String(paymentMethod),
      String(status),
      transactionId !== undefined ? transactionId : null,
      notes !== undefined ? notes : null
    );
  } catch (err) {
    if (!err.message?.includes("no such table")) {
      console.warn("⚠️  PaymentLog write failed:", err.message);
    }
  }
};

module.exports = { writeLog, writePaymentLog };
