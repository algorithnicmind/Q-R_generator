const QRCode = require('../models/QRCode');
const ScanLog = require('../models/ScanLog');
const path = require('path');

/**
 * Handle QR code redirect and tracking
 * GET /q/:qrCodeId
 */
exports.handleRedirect = async (req, res, next) => {
  try {
    const { qrCodeId } = req.params;

    // Find the QR code
    const qrCode = await QRCode.findOne({ qr_code_id: qrCodeId });

    // QR code not found
    if (!qrCode) {
      return res.status(404).send(getErrorPage('not_found'));
    }

    // Check if QR is valid for redirect
    const validity = qrCode.isValidForRedirect();

    if (!validity.valid) {
      return res.status(410).send(getErrorPage(validity.reason));
    }

    // Log the scan BEFORE redirect (important!)
    await ScanLog.create({
      qr_code_id: qrCodeId
    });

    // Redirect to target URL
    res.redirect(302, qrCode.target_url);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send(getErrorPage('error'));
  }
};

/**
 * Generate error page HTML
 */
function getErrorPage(type) {
  const messages = {
    not_found: {
      title: 'QR Code Not Found',
      message: 'This QR code does not exist or has been deleted.',
      icon: '🔍'
    },
    expired: {
      title: 'QR Code Expired',
      message: 'This QR code has expired and is no longer active.',
      icon: '⏰'
    },
    disabled: {
      title: 'QR Code Disabled',
      message: 'This QR code has been disabled by its owner.',
      icon: '🚫'
    },
    error: {
      title: 'Something Went Wrong',
      message: 'An error occurred while processing your request.',
      icon: '⚠️'
    }
  };

  const { title, message, icon } = messages[type] || messages.error;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Smart QR Generator</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: #fff;
    }
    
    .container {
      text-align: center;
      padding: 40px;
      max-width: 500px;
    }
    
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    
    h1 {
      font-size: 28px;
      margin-bottom: 15px;
      color: #fff;
    }
    
    p {
      font-size: 16px;
      color: #a0a0a0;
      line-height: 1.6;
    }
    
    .card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 50px 40px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    }
    
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="icon">${icon}</div>
      <h1>${title}</h1>
      <p>${message}</p>
      <p class="footer">Smart QR Generator</p>
    </div>
  </div>
</body>
</html>
  `;
}
