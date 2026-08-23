const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwt");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeLog } = require("../utils/logger");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, pincode, phone } = req.body;
    if (!name || !email || !password) {
      return errorResponse(res, "Name, email, and password are required.", 400);
    }
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return errorResponse(res, "User with this email already exists.", 400);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, passwordHash, pincode: pincode || "641001", phone: phone || "+91 98765 43210", role: "customer", sparksBalance: 680 },
      select: { id: true, name: true, email: true, pincode: true, phone: true, role: true, sparksBalance: true, createdAt: true },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    await writeLog({
      type: "SUCCESS",
      action: "User Registered",
      category: "user",
      details: `New customer registered: ${name} (${normalizedEmail}) — Role: customer, Sparks: 680`,
      actor: `Customer: ${name}`,
      userId: user.id,
      ipAddress: req.ip || null,
    });

    return successResponse(res, { user, token }, "User registered successfully!", 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, "Email and password are required.", 400);

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return errorResponse(res, "Invalid email or password.", 401);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await writeLog({
        type: "WARN",
        action: "Login Failed",
        category: "user",
        details: `Failed login attempt for email: ${normalizedEmail}`,
        actor: "Unknown",
        ipAddress: req.ip || null,
      });
      return errorResponse(res, "Invalid email or password.", 401);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { passwordHash: _, ...safeUser } = user;

    await writeLog({
      type: "SUCCESS",
      action: "User Login",
      category: "user",
      details: `${user.name} (${user.email}) logged in — Role: ${user.role}`,
      actor: user.role === "admin" ? `Admin: ${user.name}` : `Customer: ${user.name}`,
      userId: user.id,
      ipAddress: req.ip || null,
    });

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

// In-memory OTP store for demo/development
const otpStore = new Map();

exports.sendOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return errorResponse(res, "Mobile number is required.", 400);

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) return errorResponse(res, "Please enter a valid 10-digit mobile number.", 400);

    // Default OTP for development / demo testing: 1234
    const otp = "1234";
    otpStore.set(cleanPhone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    await writeLog({
      type: "INFO",
      action: "OTP Sent",
      category: "user",
      details: `OTP sent to mobile number: ${phone} (Demo OTP: ${otp})`,
      actor: `Mobile User: ${phone}`,
      ipAddress: req.ip || null,
    });

    return successResponse(
      res,
      { phone, otp, message: "OTP sent successfully! (Development OTP: 1234)" },
      "OTP sent successfully!"
    );
  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return errorResponse(res, "Mobile number and OTP are required.", 400);

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const stored = otpStore.get(cleanPhone);

    // Accept "1234" as master OTP for demo or match stored OTP
    if (otp !== "1234" && (!stored || stored.otp !== otp || stored.expiresAt < Date.now())) {
      return errorResponse(res, "Invalid or expired OTP. Use demo OTP: 1234", 400);
    }

    // Clean up used OTP
    otpStore.delete(cleanPhone);

    const formattedPhone = phone.startsWith("+") ? phone : `+91 ${cleanPhone.slice(-10)}`;
    const email = `user_${cleanPhone.slice(-10)}@tinytots.app`;

    let user = await prisma.user.findFirst({
      where: { OR: [{ phone: formattedPhone }, { email }] },
    });

    if (!user) {
      const passwordHash = await bcrypt.hash("OTP_USER_SECURE", 10);
      user = await prisma.user.create({
        data: {
          name: `Kids Club Member (${cleanPhone.slice(-4)})`,
          email,
          passwordHash,
          phone: formattedPhone,
          pincode: "641001",
          role: "customer",
          sparksBalance: 680,
        },
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { passwordHash: _, ...safeUser } = user;

    await writeLog({
      type: "SUCCESS",
      action: "OTP Login Verified",
      category: "user",
      details: `${user.name} (${user.phone}) logged in via Mobile OTP`,
      actor: `Customer: ${user.name}`,
      userId: user.id,
      ipAddress: req.ip || null,
    });

    return successResponse(res, { user: safeUser, token }, "OTP verified & login successful!");
  } catch (error) {
    next(error);
  }
};

