const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  qr_code_id: {
    type: String,
    required: true,
    index: true
  },
  scanned_at: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient queries
scanLogSchema.index({ scanned_at: -1 });
scanLogSchema.index({ qr_code_id: 1, scanned_at: -1 });

// Static method to get scan count for a QR code
scanLogSchema.statics.getScanCount = async function(qrCodeId) {
  return await this.countDocuments({ qr_code_id: qrCodeId });
};

// Static method to get scan statistics
scanLogSchema.statics.getStats = async function(qrCodeId, options = {}) {
  const { from, to, groupBy = 'day' } = options;
  
  // Build match query
  const matchQuery = { qr_code_id: qrCodeId };
  if (from || to) {
    matchQuery.scanned_at = {};
    if (from) matchQuery.scanned_at.$gte = new Date(from);
    if (to) matchQuery.scanned_at.$lte = new Date(to);
  }

  // Determine date format based on groupBy
  let dateFormat;
  switch (groupBy) {
    case 'hour':
      dateFormat = '%Y-%m-%d %H:00';
      break;
    case 'week':
      dateFormat = '%Y-W%U';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  // Aggregate scans by period
  const scansByPeriod = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$scanned_at' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        count: 1
      }
    }
  ]);

  // Get total count
  const totalScans = await this.countDocuments({ qr_code_id: qrCodeId });

  // Get first and last scan
  const firstScan = await this.findOne({ qr_code_id: qrCodeId })
    .sort({ scanned_at: 1 })
    .select('scanned_at');
  
  const lastScan = await this.findOne({ qr_code_id: qrCodeId })
    .sort({ scanned_at: -1 })
    .select('scanned_at');

  // Get recent scans
  const recentScans = await this.find({ qr_code_id: qrCodeId })
    .sort({ scanned_at: -1 })
    .limit(10)
    .select('scanned_at');

  return {
    total_scans: totalScans,
    first_scan: firstScan?.scanned_at || null,
    last_scan: lastScan?.scanned_at || null,
    scans_by_period: scansByPeriod,
    recent_scans: recentScans
  };
};

const ScanLog = mongoose.model('ScanLog', scanLogSchema);

module.exports = ScanLog;
