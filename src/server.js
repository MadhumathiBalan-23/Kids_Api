require("dotenv").config();
const app = require("./app");
const os = require("os");

const PORT = process.env.PORT || 5001;

// Get LAN IP for physical device info
const getLanIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
};

const server = app.listen(PORT, "0.0.0.0", () => {
  const lanIP = getLanIP();
  console.log(`\n🚀 TinyTots REST API Server is running on port ${PORT}`);
  console.log(`📡 Local:   http://localhost:${PORT}/api`);
  console.log(`📱 Android Emulator: http://10.0.2.2:${PORT}/api`);
  console.log(`📲 Physical Device (WiFi): http://${lanIP}:${PORT}/api`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/api/health\n`);
});


process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});
