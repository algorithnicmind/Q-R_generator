const express = require('express');
const router = express.Router();
const redirectController = require('../controllers/redirectController');

// Handle QR code scan and redirect
// GET /q/:qrCodeId
router.get('/:qrCodeId', redirectController.handleRedirect);

module.exports = router;
