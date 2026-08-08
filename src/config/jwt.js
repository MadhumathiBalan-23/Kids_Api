const jwt = require("jsonwebtoken");

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "tinytots_super_secret_jwt_key_2026",
  expiresIn: process.env.JWT_EXPIRE || "30d",
};

/**
 * Generate a JWT token for a user
 * @param {Object} payload - Data to embed in the token (e.g. { id, email, role })
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  });
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_CONFIG.secret);
};

module.exports = {
  JWT_CONFIG,
  generateToken,
  verifyToken,
};
