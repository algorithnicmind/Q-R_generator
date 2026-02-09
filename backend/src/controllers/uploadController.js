const { uploadFile } = require('../services/cloudinary');
const fs = require('fs');

exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }
    
    // Determine resource type (force 'raw' for PDFs to avoid corruption/processing issues)
    const isPDF = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
    const resourceType = isPDF ? 'raw' : 'auto';
    
    // Upload file to Cloudinary
    const url = await uploadFile(req.file.path, 'qr-uploads', resourceType);
    
    res.status(200).json({
      status: 'success',
      url
    });
  } catch (error) {
    next(error);
  }
};
