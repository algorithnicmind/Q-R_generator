const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Create new QR code
// POST /api/qr
router.post('/', qrController.createQR);

// Get all QR codes (paginated)
// GET /api/qr
router.get('/', qrController.getAllQRs);

// Get single QR code details
// GET /api/qr/:qrCodeId
router.get('/:qrCodeId', qrController.getQR);

// Get QR code statistics
// GET /api/qr/:qrCodeId/stats
router.get('/:qrCodeId/stats', qrController.getQRStats);

// Update QR code
// PATCH /api/qr/:qrCodeId
router.patch('/:qrCodeId', qrController.updateQR);

// Delete QR code
// DELETE /api/qr/:qrCodeId
router.delete('/:qrCodeId', qrController.deleteQR);


module.exports = router;
