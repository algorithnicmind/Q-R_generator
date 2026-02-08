const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  qr_code_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    default: 'Untitled QR',
    trim: true,
    maxlength: 100
  },
  target_url: {
    type: String,
    required: [true, 'Target URL is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['url', 'form', 'video', 'document'],
    default: 'url'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    default: null
  }
});

// Update the updated_at field on save
qrCodeSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Update the updated_at field on update
qrCodeSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updated_at: new Date() });
  next();
});

// Create indexes
qrCodeSchema.index({ is_active: 1 });
qrCodeSchema.index({ created_at: -1 });
qrCodeSchema.index({ expires_at: 1 });
qrCodeSchema.index({ is_active: 1, created_at: -1 });

// Virtual for checking if QR is expired
qrCodeSchema.virtual('is_expired').get(function() {
  if (!this.expires_at) return false;
  return new Date() > this.expires_at;
});

// Method to check if QR is valid for redirect
qrCodeSchema.methods.isValidForRedirect = function() {
  if (!this.is_active) {
    return { valid: false, reason: 'disabled' };
  }
  if (this.expires_at && new Date() > this.expires_at) {
    return { valid: false, reason: 'expired' };
  }
  return { valid: true };
};

// Ensure virtuals are included when converting to JSON
qrCodeSchema.set('toJSON', { virtuals: true });
qrCodeSchema.set('toObject', { virtuals: true });

const QRCode = mongoose.model('QRCode', qrCodeSchema);

module.exports = QRCode;
