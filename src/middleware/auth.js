const { verifyToken } = require("../config/jwt");
const prisma = require("../config/db");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Authentication Middleware: Extracts & verifies JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Access denied. No authorization token provided.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return errorResponse(res, "Invalid or expired token.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pincode: true,
        phone: true,
        avatar: true,
        sparksBalance: true,
      },
    });

    if (!user) {
      return errorResponse(res, "User account no longer exists.", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, "Invalid or expired token.", 401);
  }
};

/**
 * Optional Authentication: Attaches user if token exists
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            pincode: true,
            phone: true,
          },
        });
        if (user) req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
};

/**
 * Role-Based Access Control
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, "Access forbidden: Insufficient permissions.", 403);
    }
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
};
