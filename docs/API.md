# 📡 API Documentation

Complete API reference for the Smart QR Generator backend.

---

## Base URL

```
Development: http://localhost:3000
Production:  https://yourdomain.com
```

---

## Response Format

All API responses follow this structure:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

---

## Endpoints Overview

| Method   | Endpoint                  | Description                      |
| -------- | ------------------------- | -------------------------------- |
| `POST`   | `/api/qr`                 | Create a new QR code             |
| `GET`    | `/api/qr`                 | List all QR codes                |
| `GET`    | `/api/qr/:qrCodeId`       | Get QR code details              |
| `PATCH`  | `/api/qr/:qrCodeId`       | Update QR code                   |
| `DELETE` | `/api/qr/:qrCodeId`       | Delete QR code                   |
| `GET`    | `/api/qr/:qrCodeId/stats` | Get scan statistics              |
| `GET`    | `/q/:qrCodeId`            | Redirect endpoint (scan handler) |

---

## QR Code Endpoints

### Create QR Code

Create a new QR code with tracking capability.

```http
POST /api/qr
Content-Type: application/json
```

#### Request Body

| Field        | Type     | Required | Description                                 |
| ------------ | -------- | -------- | ------------------------------------------- |
| `target_url` | `string` | ✅ Yes   | The destination URL                         |
| `name`       | `string` | ❌ No    | Friendly name for the QR                    |
| `type`       | `string` | ❌ No    | QR type: `url`, `form`, `video`, `document` |
| `expires_at` | `string` | ❌ No    | ISO 8601 expiry date                        |

#### Example Request

```bash
curl -X POST http://localhost:3000/api/qr \
  -H "Content-Type: application/json" \
  -d '{
    "target_url": "https://example.com/my-page",
    "name": "Marketing Campaign QR",
    "type": "url",
    "expires_at": "2026-12-31T23:59:59Z"
  }'
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "qr_code_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Marketing Campaign QR",
    "target_url": "https://example.com/my-page",
    "redirect_url": "https://yourdomain.com/q/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "qr_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "type": "url",
    "is_active": true,
    "created_at": "2026-02-08T12:00:00Z",
    "expires_at": "2026-12-31T23:59:59Z"
  },
  "message": "QR code created successfully"
}
```

#### Error Responses

| Status | Code                     | Description                |
| ------ | ------------------------ | -------------------------- |
| 400    | `INVALID_URL`            | Target URL is not valid    |
| 400    | `MISSING_REQUIRED_FIELD` | Required field missing     |
| 400    | `INVALID_EXPIRY_DATE`    | Expiry date is in the past |

---

### List All QR Codes

Retrieve all QR codes (with pagination).

```http
GET /api/qr
```

#### Query Parameters

| Parameter | Type      | Default       | Description                             |
| --------- | --------- | ------------- | --------------------------------------- |
| `page`    | `integer` | 1             | Page number                             |
| `limit`   | `integer` | 10            | Items per page                          |
| `status`  | `string`  | all           | Filter: `active`, `inactive`, `expired` |
| `sort`    | `string`  | `-created_at` | Sort field (prefix `-` for descending)  |

#### Example Request

```bash
curl "http://localhost:3000/api/qr?page=1&limit=10&status=active"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "qr_codes": [
      {
        "qr_code_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Marketing Campaign QR",
        "target_url": "https://example.com/my-page",
        "type": "url",
        "is_active": true,
        "total_scans": 42,
        "created_at": "2026-02-08T12:00:00Z",
        "expires_at": "2026-12-31T23:59:59Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 47,
      "items_per_page": 10
    }
  }
}
```

---

### Get QR Code Details

Retrieve details of a specific QR code.

```http
GET /api/qr/:qrCodeId
```

#### Path Parameters

| Parameter  | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `qrCodeId` | `string` | The unique QR code identifier |

#### Example Request

```bash
curl http://localhost:3000/api/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "qr_code_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Marketing Campaign QR",
    "target_url": "https://example.com/my-page",
    "redirect_url": "https://yourdomain.com/q/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "qr_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
    "type": "url",
    "is_active": true,
    "total_scans": 42,
    "last_scanned_at": "2026-02-08T10:30:00Z",
    "created_at": "2026-02-08T12:00:00Z",
    "expires_at": "2026-12-31T23:59:59Z"
  }
}
```

#### Error Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "QR_NOT_FOUND",
    "message": "QR code not found"
  }
}
```

---

### Update QR Code

Update an existing QR code's properties.

```http
PATCH /api/qr/:qrCodeId
Content-Type: application/json
```

#### Request Body

| Field        | Type      | Description           |
| ------------ | --------- | --------------------- |
| `target_url` | `string`  | New destination URL   |
| `name`       | `string`  | New name              |
| `is_active`  | `boolean` | Enable/disable status |
| `expires_at` | `string`  | New expiry date       |

#### Example Request

```bash
curl -X PATCH http://localhost:3000/api/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "target_url": "https://example.com/new-page",
    "is_active": false
  }'
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "qr_code_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "target_url": "https://example.com/new-page",
    "is_active": false,
    "updated_at": "2026-02-08T14:00:00Z"
  },
  "message": "QR code updated successfully"
}
```

---

### Delete QR Code

Permanently delete a QR code and its scan history.

```http
DELETE /api/qr/:qrCodeId
```

#### Example Request

```bash
curl -X DELETE http://localhost:3000/api/qr/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "QR code deleted successfully"
}
```

---

### Get QR Code Statistics

Retrieve scan statistics for a specific QR code.

```http
GET /api/qr/:qrCodeId/stats
```

#### Query Parameters

| Parameter  | Type     | Default | Description                                   |
| ---------- | -------- | ------- | --------------------------------------------- |
| `from`     | `string` | -       | Start date (ISO 8601)                         |
| `to`       | `string` | -       | End date (ISO 8601)                           |
| `group_by` | `string` | `day`   | Group results: `hour`, `day`, `week`, `month` |

#### Example Request

```bash
curl "http://localhost:3000/api/qr/a1b2c3d4/stats?from=2026-02-01&to=2026-02-08&group_by=day"
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "qr_code_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "total_scans": 142,
    "first_scan": "2026-02-01T08:30:00Z",
    "last_scan": "2026-02-08T10:30:00Z",
    "scans_by_period": [
      { "date": "2026-02-01", "count": 15 },
      { "date": "2026-02-02", "count": 23 },
      { "date": "2026-02-03", "count": 18 },
      { "date": "2026-02-04", "count": 31 },
      { "date": "2026-02-05", "count": 12 },
      { "date": "2026-02-06", "count": 20 },
      { "date": "2026-02-07", "count": 15 },
      { "date": "2026-02-08", "count": 8 }
    ],
    "recent_scans": [
      { "scanned_at": "2026-02-08T10:30:00Z" },
      { "scanned_at": "2026-02-08T09:45:00Z" },
      { "scanned_at": "2026-02-08T09:15:00Z" }
    ]
  }
}
```

---

## Redirect Endpoint

### Handle QR Scan

The core endpoint that handles QR code scans.

```http
GET /q/:qrCodeId
```

This endpoint:

1. Validates the QR code exists
2. Checks if QR is active
3. Checks if QR is not expired
4. Logs the scan to database
5. Redirects to target URL (HTTP 302)

#### Path Parameters

| Parameter  | Type     | Description                   |
| ---------- | -------- | ----------------------------- |
| `qrCodeId` | `string` | The unique QR code identifier |

#### Success Response (302 Redirect)

```http
HTTP/1.1 302 Found
Location: https://example.com/my-page
```

#### Error Scenarios

| Scenario     | Response                                      |
| ------------ | --------------------------------------------- |
| QR not found | Render error page: "QR code not found"        |
| QR disabled  | Render error page: "This QR code is disabled" |
| QR expired   | Render error page: "This QR code has expired" |

---

## Error Codes Reference

| Code                     | HTTP Status | Description                 |
| ------------------------ | ----------- | --------------------------- |
| `VALIDATION_ERROR`       | 400         | Input validation failed     |
| `INVALID_URL`            | 400         | URL format is invalid       |
| `MISSING_REQUIRED_FIELD` | 400         | Required field not provided |
| `INVALID_EXPIRY_DATE`    | 400         | Expiry date in the past     |
| `QR_NOT_FOUND`           | 404         | QR code doesn't exist       |
| `QR_DISABLED`            | 410         | QR code is disabled         |
| `QR_EXPIRED`             | 410         | QR code has expired         |
| `RATE_LIMIT_EXCEEDED`    | 429         | Too many requests           |
| `INTERNAL_ERROR`         | 500         | Server error                |

---

## Rate Limiting

| Endpoint | Limit                |
| -------- | -------------------- |
| `/api/*` | 100 requests/minute  |
| `/q/:id` | 1000 requests/minute |

When rate limit is exceeded:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

---

## Code Examples

### JavaScript (Fetch API)

```javascript
// Create QR Code
async function createQR(targetUrl, name) {
  const response = await fetch("http://localhost:3000/api/qr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_url: targetUrl, name }),
  });
  return response.json();
}

// Get QR Stats
async function getStats(qrCodeId) {
  const response = await fetch(
    `http://localhost:3000/api/qr/${qrCodeId}/stats`,
  );
  return response.json();
}

// Toggle QR Status
async function toggleQR(qrCodeId, isActive) {
  const response = await fetch(`http://localhost:3000/api/qr/${qrCodeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: isActive }),
  });
  return response.json();
}
```

### Python (Requests)

```python
import requests

BASE_URL = "http://localhost:3000"

# Create QR Code
def create_qr(target_url, name):
    response = requests.post(
        f"{BASE_URL}/api/qr",
        json={"target_url": target_url, "name": name}
    )
    return response.json()

# Get QR Stats
def get_stats(qr_code_id):
    response = requests.get(f"{BASE_URL}/api/qr/{qr_code_id}/stats")
    return response.json()

# Toggle QR Status
def toggle_qr(qr_code_id, is_active):
    response = requests.patch(
        f"{BASE_URL}/api/qr/{qr_code_id}",
        json={"is_active": is_active}
    )
    return response.json()
```

---

## Testing with cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Create QR
curl -X POST http://localhost:3000/api/qr \
  -H "Content-Type: application/json" \
  -d '{"target_url": "https://google.com", "name": "Test QR"}'

# Get all QRs
curl http://localhost:3000/api/qr

# Get specific QR
curl http://localhost:3000/api/qr/YOUR_QR_ID

# Get stats
curl http://localhost:3000/api/qr/YOUR_QR_ID/stats

# Disable QR
curl -X PATCH http://localhost:3000/api/qr/YOUR_QR_ID \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'

# Delete QR
# Delete QR
curl -X DELETE http://localhost:3000/api/qr/YOUR_QR_ID
```

---

## File Upload Endpoints

### Upload Media

Upload an image, video, or document to generate a public URL.

```http
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

#### Request Body (Form Data)

| Field  | Type   | Required | Description                  |
| ------ | ------ | -------- | ---------------------------- |
| `file` | `file` | ✅ Yes   | The file to upload (Max 5MB) |

#### Success Response (200 OK)

```json
{
  "status": "success",
  "url": "https://res.cloudinary.com/demo/image/upload/v161405/sample.jpg"
}
```
