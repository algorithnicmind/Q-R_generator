const { uploadFile } = require('../services/cloudinary');
const fs = require('fs');

exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }
    
    // Upload file to Cloudinary (Use auto-detect)
    let url = await uploadFile(req.file.path, 'qr-uploads');

    // For PDFs: Force download (fl_attachment) to fix mobile viewer issues
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
      url = url.replace('/upload/', '/upload/fl_attachment/'); 
    }
    
    res.status(200).json({
      status: 'success',
      url
    });
  } catch (error) {
    next(error);
  }
};
