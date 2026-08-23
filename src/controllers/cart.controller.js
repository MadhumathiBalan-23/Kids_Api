const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeLog } = require("../utils/logger");

const PROMO_CODES = {
  KIDS50:    { discountPercent: 50, maxDiscount: 200 },
  SPARKS20:  { discountPercent: 20, maxDiscount: 100 },
  WELCOME10: { discountPercent: 10, maxDiscount:  50 },
};

exports.calculateCart = async (req, res, next) => {
  try {
    const { items = [], promoCode } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, "Cart is empty. Please provide an items array.", 400);
    }

    let subtotal = 0;
    let totalItemsCount = 0;
    const detailedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product) {
        const qty = item.quantity || 1;
        const itemTotal = product.price * qty;
        subtotal += itemTotal;
        totalItemsCount += qty;
        detailedItems.push({ product, quantity: qty, itemTotal });
      }
    }

    let discountAmount = 0;
    let promoApplied = null;
    const code = promoCode ? promoCode.toUpperCase() : null;
    if (code && PROMO_CODES[code]) {
      const promo = PROMO_CODES[code];
      discountAmount = Math.min((subtotal * promo.discountPercent) / 100, promo.maxDiscount);
      promoApplied = { code, discountPercent: promo.discountPercent, discountAmount };
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);
    return successResponse(
      res,
      { items: detailedItems, totalItemsCount, subtotal, discountAmount, deliveryFee: 0, finalTotal, promoApplied },
      "Cart calculated successfully."
    );
  } catch (error) {
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    if (!req.user) return successResponse(res, [], "Guest cart.");
    const cart = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });
    return successResponse(res, cart, "Cart items fetched successfully.");
  } catch (error) {
    next(error);
  }
};

exports.updateCart = async (req, res, next) => {
  try {
    if (!req.user) return successResponse(res, req.body.items || [], "Cart updated (guest).");

    const userId = req.user.id;
    const { items = [] } = req.body;

    await prisma.cartItem.deleteMany({ where: { userId } });
    for (const item of items) {
      if (item.productId) {
        await prisma.cartItem.create({
          data: { userId, productId: item.productId, quantity: item.quantity || 1 },
        });
      }
    }
    const updated = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    // Log cart update to DB
    await writeLog({
      type: "INFO",
      action: "Cart Updated",
      category: "cart",
      details: `Cart updated for user #${userId} — ${items.length} item(s): ${items.map(i => `${i.productId} x${i.quantity}`).join(", ")}`,
      actor: req.user ? `Customer: ${req.user.name}` : "Guest",
      userId,
    });

    return successResponse(res, updated, "Cart updated successfully.");
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    if (req.user) {
      await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
      await writeLog({
        type: "INFO",
        action: "Cart Cleared",
        category: "cart",
        details: `Cart cleared for user #${req.user.id} (${req.user.name}) after order checkout`,
        actor: `Customer: ${req.user.name}`,
        userId: req.user.id,
      });
    }
    return successResponse(res, [], "Cart cleared successfully.");
  } catch (error) {
    next(error);
  }
};
