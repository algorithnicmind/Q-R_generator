# 📋 Project Specification

## Smart QR Generator with Tracking & Control

---

## 1. Overview

A web-based QR code generator that creates trackable, controllable QR codes with:

- **Scan tracking** - Know how many times and when QR codes are scanned
- **QR expiry** - Set expiration dates for QR codes
- **Dynamic links** - Update destinations without changing the QR image

---

## 2. Problem Statement

Traditional QR generators:

- ❌ Generate static QR codes only
- ❌ Cannot track scans
- ❌ Cannot expire or disable QR codes
- ❌ Require reprinting if links change

**This project solves all of these.**

---

## 3. Target Users

- Students & educators
- College clubs & societies
- Event organizers
- Small business owners
- Anyone needing free, trackable QR codes

---

## 4. Core User Flow

```
User opens website
  → Selects QR type (URL, Form, Video, Document)
  → Enters content/link
  → Clicks Generate QR
  → Downloads QR image
  → Shares/prints QR
  → Someone scans QR
  → Request goes to backend
  → Backend logs scan
  → Backend redirects to content
```

---

## 5. What QR Contains

Each QR code contains ONLY:

```
https://yourdomain.com/q/{unique_id}
```

It does **NOT** store actual content - just a redirect URL.

---

## 6. Features

### 6.1 QR Generation

- Generate QR for: URLs, Forms, Videos, Documents
- Download as PNG
- Custom naming

### 6.2 Dynamic Redirection

- All scans route through backend
- Backend validates, logs, then redirects

### 6.3 Scan Tracking

- Total scan count
- Scan timestamps
- No personal data collected

### 6.4 Status Control

- Active/Inactive toggle
- Optional expiry date
- Error pages for disabled/expired QRs

### 6.5 Dashboard

- View all QR codes
- See stats per QR
- Enable/disable controls

---

## 7. Tech Stack

| Layer      | Technology            |
| ---------- | --------------------- |
| Frontend   | HTML, CSS, JavaScript |
| Backend    | Node.js, Express.js   |
| Database   | MongoDB               |
| QR Library | qrcode.js             |

---

## 8. API Endpoints

| Method | Endpoint            | Purpose          |
| ------ | ------------------- | ---------------- |
| POST   | `/api/qr`           | Create QR code   |
| GET    | `/q/:id`            | Redirect & track |
| GET    | `/api/qr/:id/stats` | Get statistics   |
| PATCH  | `/api/qr/:id`       | Update QR        |
| DELETE | `/api/qr/:id`       | Delete QR        |

---

## 9. Database Schema

### QR Codes

```
id, qr_code_id, target_url, is_active, created_at, expires_at
```

### Scan Logs

```
id, qr_code_id, scanned_at
```

---

## 10. Error Handling

| Scenario    | Response         |
| ----------- | ---------------- |
| Invalid QR  | Error page       |
| Expired QR  | Expiry message   |
| Disabled QR | Inactive message |

**No blank screens. Ever.**

---

## 11. Resume Description

> "Developed a dynamic QR code generator with backend-controlled redirection, scan tracking, and expiry management, enabling reusable and controllable QR codes for real-world use cases like events and education."
