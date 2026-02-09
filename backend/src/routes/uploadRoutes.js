const express = require('express');
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Define storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp'); // Use /tmp for serverless environments (Vercel)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Init Multer with limits
const upload = multer({
  storage,
  limits: { fileSize: 4.5 * 1024 * 1024 } // 4.5 MB limit for Vercel
});

// Define route (Protected by login)
router.post('/', protect, upload.single('file'), uploadController.uploadMedia);

module.exports = router;
