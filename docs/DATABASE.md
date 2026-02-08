# 🗄️ Database Schema Documentation

Database structure for the Smart QR Generator project using MongoDB.

---

## Collections Overview

| Collection  | Purpose                                   |
| ----------- | ----------------------------------------- |
| `qr_codes`  | Stores QR code metadata and configuration |
| `scan_logs` | Records every scan for analytics          |

---

## Entity Relationship

```
QR_CODES (1) ──────────── (N) SCAN_LOGS
   │                            │
   └── qr_code_id ◄─────────────┘
```

---

## QR Codes Collection

### Schema

```javascript
const qrCodeSchema = new mongoose.Schema({
  qr_code_id: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: "Untitled QR" },
  target_url: { type: String, required: true },
  type: {
    type: String,
    enum: ["url", "form", "video", "document"],
    default: "url",
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  expires_at: { type: Date, default: null },
});
```

### Fields

| Field        | Type    | Required | Description           |
| ------------ | ------- | -------- | --------------------- |
| `qr_code_id` | String  | Yes      | UUID for redirect URL |
| `name`       | String  | No       | User-friendly name    |
| `target_url` | String  | Yes      | Destination URL       |
| `type`       | String  | No       | Content type          |
| `is_active`  | Boolean | No       | Enable/disable status |
| `created_at` | Date    | No       | Creation timestamp    |
| `updated_at` | Date    | No       | Last update timestamp |
| `expires_at` | Date    | No       | Expiration date       |

### Example Document

```json
{
  "qr_code_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Event Registration QR",
  "target_url": "https://forms.google.com/event-registration",
  "type": "form",
  "is_active": true,
  "created_at": "2026-02-08T10:00:00.000Z",
  "expires_at": "2026-03-01T23:59:59.000Z"
}
```

---

## Scan Logs Collection

### Schema

```javascript
const scanLogSchema = new mongoose.Schema({
  qr_code_id: { type: String, required: true, index: true },
  scanned_at: { type: Date, default: Date.now },
});
```

### Fields

| Field        | Type   | Required | Description          |
| ------------ | ------ | -------- | -------------------- |
| `qr_code_id` | String | Yes      | Reference to QR code |
| `scanned_at` | Date   | No       | Scan timestamp       |

### Example Document

```json
{
  "qr_code_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "scanned_at": "2026-02-08T14:30:00.000Z"
}
```

---

## Indexes

### QR Codes

```javascript
{ qr_code_id: 1 }           // Primary lookup
{ is_active: 1, created_at: -1 }  // Dashboard queries
{ expires_at: 1 }           // Expiry checks
```

### Scan Logs

```javascript
{ qr_code_id: 1 }           // Stats lookup
{ qr_code_id: 1, scanned_at: -1 } // Time-based stats
```

---

## Common Queries

### Create QR Code

```javascript
await QRCode.create({
  qr_code_id: uuidv4(),
  name: "My QR",
  target_url: "https://example.com",
});
```

### Log Scan

```javascript
await ScanLog.create({ qr_code_id: qrCodeId });
```

### Get Scan Count

```javascript
const count = await ScanLog.countDocuments({ qr_code_id: qrCodeId });
```

### Check Valid QR

```javascript
const qr = await QRCode.findOne({
  qr_code_id: qrCodeId,
  is_active: true,
  $or: [{ expires_at: null }, { expires_at: { $gt: new Date() } }],
});
```
