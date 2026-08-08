const { errorResponse } = require("../utils/apiResponse");

/**
 * Global Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("🔥 [Error Caught]:", err.message || err);

  // Multer File Upload Errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return errorResponse(res, "File size limit exceeded (Max 5MB)", 400);
    }
    return errorResponse(res, `Upload error: ${err.message}`, 400);
  }

  // JSON Web Token Errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, "Invalid authorization token", 401);
  }
  if (err.name === "TokenExpiredError") {
    return errorResponse(res, "Authorization token expired", 401);
  }

  // General Status & Message
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  return errorResponse(res, message, statusCode, process.env.NODE_ENV === "development" ? err.stack : null);
};

module.exports = errorHandler;
