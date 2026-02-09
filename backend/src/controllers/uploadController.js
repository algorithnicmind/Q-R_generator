const { uploadFile } = require('../services/cloudinary');
const fs = require('fs');

exports.uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }
    
    // Upload file to Cloudinary
    const url = await uploadFile(req.file.path);
    
    res.status(200).json({
      status: 'success',
      url
    });
  } catch (error) {
    next(error);
  }
};
