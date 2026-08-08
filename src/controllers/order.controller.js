const prisma = require("../config/db");
const { successResponse, errorResponse } = require("../utils/apiResponse");

exports.placeOrder = async (req, res, next) => {
  try {
    const { customerName, address, items = [], paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return errorResponse(res, "Cannot place an order with empty items.", 400);
    }

    const userId = req.user ? req.user.id : null;
    let totalAmount = 0;
    const resolvedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      const qty = item.quantity || 1;
      const price = product ? product.price : 500;
      totalAmount += price * qty;
      resolvedItems.push({
        productId: item.productId,
        name: product ? product.name : "Kids Fashion Item",
        quantity: qty,
        price,
      });
    }

    const orderId = "TT-" + Math.floor(100000 + Math.random() * 900000);
    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId,
        customerName: customerName || (req.user ? req.user.name : "Madhumathi"),
        address: address || "Coimbatore, Tamil Nadu - 641001",
        itemsJson: JSON.stringify(resolvedItems),
        totalAmount,
        paymentMethod: paymentMethod || "UPI / Card",
        status: "Confirmed",
      },
    });

    if (userId) {
      await prisma.notification.create({
        data: {
          userId,
          title: "📦 Order Confirmed!",
          message: `Your order #${orderId} of ₹${totalAmount.toLocaleString()} is confirmed!`,
          type: "order",
        },
      });
    }

    return successResponse(
      res,
      {
        ...order,
        items: resolvedItems,
        estimatedDelivery: "Tomorrow by 5:00 PM",
      },
      "Order placed successfully! 🚀",
      201
    );
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    const parsed = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.itemsJson || "[]"),
      estimatedDelivery: "Tomorrow by 5:00 PM",
    }));

    return successResponse(res, parsed, "Orders fetched successfully.");
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    if (!order) {
      return errorResponse(res, "Order not found.", 404);
    }

    return successResponse(
      res,
      {
        ...order,
        items: JSON.parse(order.itemsJson || "[]"),
        estimatedDelivery: "Tomorrow by 5:00 PM",
      },
      "Order details fetched successfully."
    );
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    const parsed = orders.map((o) => ({
      ...o,
      items: JSON.parse(o.itemsJson || "[]"),
      estimatedDelivery: "Tomorrow by 5:00 PM",
    }));

    return successResponse(res, parsed, "All orders fetched successfully.");
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });
    return successResponse(res, order, "Order status updated successfully.");
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerName, address, status, totalAmount, paymentMethod } = req.body;

    const data = {};
    if (customerName !== undefined) data.customerName = customerName;
    if (address !== undefined) data.address = address;
    if (status !== undefined) data.status = status;
    if (totalAmount !== undefined) data.totalAmount = parseFloat(totalAmount);
    if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data,
    });

    return successResponse(res, updatedOrder, "Order updated successfully.");
  } catch (error) {
    next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({ where: { id } });
    return successResponse(res, { id }, "Order deleted successfully.");
  } catch (error) {
    next(error);
  }
};

