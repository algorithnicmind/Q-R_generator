# 🔳 Smart QR Generator with Tracking & Control

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-brightgreen.svg)](https://www.mongodb.com/)
[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://q-r-generator.vercel.app/)

> 🚀 **Live Demo:** [https://q-r-generator.vercel.app/](https://q-r-generator.vercel.app/)

A web-based QR code generator system that creates trackable, controllable, and dynamic QR codes. Unlike traditional static QR generators, this system enables **scan tracking**, **QR expiry**, and **link updates without reprinting**.

---

## ✨ Key Features

| Feature                    | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| 🎯 **Dynamic Redirection** | QR code destination can be changed without modifying the QR image |
| 📊 **Scan Tracking**       | Track total scans, timestamps, and scan history                   |
| ⏰ **Expiry Control**      | Set expiration dates for QR codes                                 |
| 🔒 **Status Management**   | Enable/disable QR codes instantly                                 |
| 📱 **Multi-Type Support**  | Generate QR for URLs, Forms, Videos, Documents                    |
| 📈 **Dashboard**           | View and manage all QR codes in one place                         |

---

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SMART QR FLOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   User Creates QR    →    QR Contains: /q/{unique_id}                   │
│         ↓                                                                │
│   Someone Scans QR   →    Request hits backend                          │
│         ↓                                                                │
│   Backend logs scan  →    Validates QR status                           │
│         ↓                                                                │
│   Redirects to URL   ←    Or shows error if expired/disabled            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**The magic:** The QR code never changes. Only the destination does.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6.0+ (or MongoDB Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Q-R_generator.git
cd Q-R_generator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/qr_generator
BASE_URL=http://localhost:3000
NODE_ENV=development
```

---

## 📁 Project Structure

```
Q-R_generator/
├── frontend/               # Frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Utility functions
│   └── index.html
│
├── backend/                # Backend application
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   ├── app.js            # Express app setup
│   └── server.js         # Server entry point
│
├── docs/                   # Project documentation
├── tests/                  # Test files
├── .env.example           # Environment template
├── package.json           # Dependencies
└── README.md              # This file
```

---

## 🔌 API Reference

### Generate QR Code

```http
POST /api/qr
```

| Parameter    | Type     | Description                       |
| ------------ | -------- | --------------------------------- |
| `target_url` | `string` | **Required**. The destination URL |
| `name`       | `string` | Optional. QR code name            |
| `expires_at` | `date`   | Optional. Expiry date             |

**Response:**

```json
{
  "success": true,
  "data": {
    "qr_code_id": "abc123",
    "qr_image": "base64_encoded_image",
    "redirect_url": "https://yourdomain.com/q/abc123"
  }
}
```

### Scan & Redirect

```http
GET /q/:qrCodeId
```

Logs the scan and redirects to target URL.

### Get QR Stats

```http
GET /api/qr/:qrCodeId/stats
```

**Response:**

```json
{
  "success": true,
  "data": {
    "total_scans": 42,
    "scans": [
      { "scanned_at": "2026-02-08T10:30:00Z" },
      { "scanned_at": "2026-02-08T09:15:00Z" }
    ]
  }
}
```

### Update QR Status

```http
PATCH /api/qr/:qrCodeId
```

| Parameter    | Type      | Description         |
| ------------ | --------- | ------------------- |
| `is_active`  | `boolean` | Enable/disable QR   |
| `target_url` | `string`  | New destination URL |

---

## 🎨 QR Types Supported

| Type            | Example Use Case             |
| --------------- | ---------------------------- |
| 🔗 **URL**      | Website links, landing pages |
| 📝 **Form**     | Google Forms, surveys        |
| 🎬 **Video**    | YouTube links, video content |
| 📄 **Document** | PDFs, Google Drive files     |

---

## 💡 Use Cases

- **Events:** Track attendee check-ins via QR
- **Education:** Share classroom resources with scan tracking
- **Marketing:** Measure campaign QR scans
- **Retail:** Product information with updatable links
- **Restaurants:** Digital menus that can be updated

---

## 🛠️ Tech Stack

| Layer         | Technology            |
| ------------- | --------------------- |
| Frontend      | HTML, CSS, JavaScript |
| Backend       | Node.js, Express.js   |
| Database      | MongoDB               |
| QR Generation | qrcode.js             |

---

## 📖 Documentation

Detailed documentation is available in the [`docs/`](./docs) folder:

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Setup Guide](./docs/SETUP.md)
- [Contributing Guide](./docs/CONTRIBUTING.md)

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Ankit**

---

## 🌟 Show Your Support

Give a ⭐ if this project helped you!

---

<p align="center">
  <i>"Developed a dynamic QR code generator with backend-controlled redirection, scan tracking, and expiry management, enabling reusable and controllable QR codes for real-world use cases like events and education."</i>
</p>
