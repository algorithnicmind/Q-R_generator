require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/config/database");

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🔳 Smart QR Generator Server                            ║
║                                                           ║
║   Server running on: http://0.0.0.0:${PORT}                 ║
║   Local Access:      http://localhost:${PORT}               ║
║   Network Access:    ${process.env.BASE_URL}                ║
║   Environment: ${process.env.NODE_ENV || "development"}                            ║
║                                                           ║
║   API Endpoints:                                          ║
║   • POST   /api/qr          - Create QR code              ║
║   • GET    /api/qr          - List all QR codes           ║
║   • GET    /api/qr/:id      - Get QR details              ║
║   • PATCH  /api/qr/:id      - Update QR code              ║
║   • DELETE /api/qr/:id      - Delete QR code              ║
║   • GET    /api/qr/:id/stats - Get scan statistics        ║
║   • GET    /q/:id           - Redirect endpoint           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
