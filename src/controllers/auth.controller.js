const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwt");
const { successResponse, errorResponse } = require("../utils/apiResponse");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, pincode, phone } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, "Name, email, and password are required.", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return errorResponse(res, "User with this email already exists.", 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        pincode: pincode || "641001",
        phone: phone || "+91 98765 43210",
        role: "customer",
        sparksBalance: 680,
      },
      select: {
        id: true,
        name: true,
        email: true,
        pincode: true,
        phone: true,
        role: true,
        sparksBalance: true,
        createdAt: true,
      },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return successResponse(res, { user, token }, "User registered successfully!", 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email and password are required.", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { passwordHash: _, ...safeUser } = user;

    return successResponse(res, { user: safeUser, token }, "Login successful!");
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    return successResponse(res, { user: req.user }, "User profile retrieved successfully.");
  } catch (error) {
    next(error);
  }
};
