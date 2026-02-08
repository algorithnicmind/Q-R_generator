# 📦 User Guide

A complete guide for using the Smart QR Generator application.

---

## Getting Started

### 1. Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

(or your deployed URL)

---

## Creating a QR Code

### Step 1: Select QR Type

Choose from:

- 🔗 **URL** - Website links
- 📝 **Form** - Google Forms, surveys
- 🎬 **Video** - YouTube links
- 📄 **Document** - PDFs, Google Drive

### Step 2: Enter Your Link

Paste the full URL of your destination:

```
https://example.com/my-page
```

### Step 3: Add Details (Optional)

- **Name**: Give your QR a friendly name
- **Expiry Date**: Set when the QR should stop working

### Step 4: Generate

Click **"Generate QR"** button.

### Step 5: Download

Click **"Download PNG"** to save your QR code.

---

## Sharing Your QR Code

Once downloaded, you can:

- Print it on flyers, posters, or business cards
- Share digitally via email or social media
- Embed in presentations or documents

---

## Tracking Scans

### View Statistics

1. Go to **Dashboard**
2. Find your QR code
3. Click **"View Stats"**

You'll see:

- Total number of scans
- Scan history with timestamps
- Activity graph

---

## Managing QR Codes

### Enable/Disable

Toggle the **Active** switch to:

- ✅ **Active**: QR works normally
- ❌ **Inactive**: QR shows error page

### Update Destination

1. Click **"Edit"** on your QR
2. Enter new URL
3. Save changes

**Note:** The QR image doesn't change - only the destination!

### Delete QR

1. Click **"Delete"** on your QR
2. Confirm deletion
3. QR and all scan data removed

---

## Error Messages

When someone scans a QR, they may see:

| Message               | Meaning               |
| --------------------- | --------------------- |
| "QR code not found"   | Invalid or deleted QR |
| "QR code has expired" | Past expiry date      |
| "QR code is disabled" | Manually turned off   |

---

## Best Practices

1. **Use descriptive names** - Easy to identify later
2. **Set expiry for events** - Auto-disable after event ends
3. **Test before printing** - Scan your QR first
4. **Monitor scans** - Check dashboard regularly

---

## FAQ

### Can I change the destination URL later?

Yes! Update anytime without changing the QR image.

### How many QR codes can I create?

Unlimited (depends on your deployment).

### Is my data private?

Yes. We only track scan counts and timestamps, no personal data.

### What size should I print the QR?

Minimum 2cm x 2cm for reliable scanning.
