const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const { runMigrations } = require("./utils/migrate");

// Import Route Handlers
const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const bannerRoutes = require("./routes/banner.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const profileRoutes = require("./routes/profile.routes");
const notificationRoutes = require("./routes/notification.routes");
const uploadRoutes = require("./routes/upload.routes");
const logRoutes = require("./routes/log.routes");

const app = express();


// Standard Middlewares with 50MB limits for image data
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
if (logger) app.use(logger);


// Serve static uploaded assets
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    appName: "TinyTots Kids Fashion REST API",
    database: "SQLite (Prisma ORM)",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes according to architecture
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/logs", logRoutes);

// Auto-create ActivityLog & PaymentLog tables on startup
runMigrations();

// 404 Not Found Handler

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
