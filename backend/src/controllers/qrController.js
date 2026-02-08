const QRCode = require('../models/QRCode');
const ScanLog = require('../models/ScanLog');
const { v4: uuidv4 } = require('uuid');
const qrcode = require('qrcode');
const { validateUrl } = require('../utils/validators');

/**
 * Create a new QR code
 * POST /api/qr
 */
exports.createQR = async (req, res, next) => {
  try {
    const { target_url, name, type, expires_at } = req.body;

    // Validate target URL
    if (!target_url) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_REQUIRED_FIELD', message: 'target_url is required' }
      });
    }

    if (!validateUrl(target_url)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_URL', message: 'Please provide a valid URL' }
      });
    }

    // Validate expiry date if provided
    if (expires_at && new Date(expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_EXPIRY_DATE', message: 'Expiry date must be in the future' }
      });
    }

    // Generate unique QR code ID
    const qr_code_id = uuidv4();
    const redirect_url = `${process.env.BASE_URL}/q/${qr_code_id}`;

    // Generate QR code image
    const qr_image = await qrcode.toDataURL(redirect_url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Create QR code in database
    const qrCode = await QRCode.create({
      qr_code_id,
      user: req.user.id,
      name: name || 'Untitled QR',
      target_url,
      type: type || 'url',
      expires_at: expires_at || null
    });

    res.status(201).json({
      success: true,
      data: {
        qr_code_id: qrCode.qr_code_id,
        name: qrCode.name,
        target_url: qrCode.target_url,
        redirect_url,
        qr_image,
        type: qrCode.type,
        is_active: qrCode.is_active,
        created_at: qrCode.created_at,
        expires_at: qrCode.expires_at
      },
      message: 'QR code created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all QR codes (paginated)
 * GET /api/qr
 */
exports.getAllQRs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || 'all';
    const sort = req.query.sort || '-created_at';
    const skip = (page - 1) * limit;

    // Build query based on status filter
    let query = { user: req.user.id };
    const now = new Date();

    if (status === 'active') {
      query.is_active = true;
      query.$or = [
        { expires_at: null },
        { expires_at: { $gt: now } }
      ];
    } else if (status === 'inactive') {
      query.is_active = false;
    } else if (status === 'expired') {
      query.expires_at = { $lt: now };
    }

    // Get QR codes with pagination
    const [qrCodes, total] = await Promise.all([
      QRCode.find(query).sort(sort).skip(skip).limit(limit),
      QRCode.countDocuments(query)
    ]);

    // Attach scan counts to each QR code
    const qrCodesWithStats = await Promise.all(
      qrCodes.map(async (qr) => {
        const scanCount = await ScanLog.getScanCount(qr.qr_code_id);
        const lastScan = await ScanLog.findOne({ qr_code_id: qr.qr_code_id })
          .sort({ scanned_at: -1 })
          .select('scanned_at');
        
        return {
          ...qr.toObject(),
          total_scans: scanCount,
          last_scanned_at: lastScan?.scanned_at || null
        };
      })
    );

    res.json({
      success: true,
      data: {
        qr_codes: qrCodesWithStats,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single QR code details
 * GET /api/qr/:qrCodeId
 */
exports.getQR = async (req, res, next) => {
  try {
    const { qrCodeId } = req.params;

    const qrCode = await QRCode.findOne({ qr_code_id: qrCodeId, user: req.user.id });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        error: { code: 'QR_NOT_FOUND', message: 'QR code not found' }
      });
    }

    // Get scan statistics
    const scanCount = await ScanLog.getScanCount(qrCodeId);
    const lastScan = await ScanLog.findOne({ qr_code_id: qrCodeId })
      .sort({ scanned_at: -1 })
      .select('scanned_at');

    // Regenerate QR image
    const redirect_url = `${process.env.BASE_URL}/q/${qrCodeId}`;
    const qr_image = await qrcode.toDataURL(redirect_url, {
      width: 300,
      margin: 2
    });

    res.json({
      success: true,
      data: {
        ...qrCode.toObject(),
        redirect_url,
        qr_image,
        total_scans: scanCount,
        last_scanned_at: lastScan?.scanned_at || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update QR code
 * PATCH /api/qr/:qrCodeId
 */
exports.updateQR = async (req, res, next) => {
  try {
    const { qrCodeId } = req.params;
    const { target_url, name, is_active, expires_at } = req.body;

    // Find the QR code
    const qrCode = await QRCode.findOne({ qr_code_id: qrCodeId, user: req.user.id });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        error: { code: 'QR_NOT_FOUND', message: 'QR code not found' }
      });
    }

    // Validate new URL if provided
    if (target_url && !validateUrl(target_url)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_URL', message: 'Please provide a valid URL' }
      });
    }

    // Validate new expiry date if provided
    if (expires_at && new Date(expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_EXPIRY_DATE', message: 'Expiry date must be in the future' }
      });
    }

    // Update fields
    if (target_url !== undefined) qrCode.target_url = target_url;
    if (name !== undefined) qrCode.name = name;
    if (is_active !== undefined) qrCode.is_active = is_active;
    if (expires_at !== undefined) qrCode.expires_at = expires_at;

    await qrCode.save();

    res.json({
      success: true,
      data: {
        qr_code_id: qrCode.qr_code_id,
        name: qrCode.name,
        target_url: qrCode.target_url,
        is_active: qrCode.is_active,
        expires_at: qrCode.expires_at,
        updated_at: qrCode.updated_at
      },
      message: 'QR code updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete QR code
 * DELETE /api/qr/:qrCodeId
 */
exports.deleteQR = async (req, res, next) => {
  try {
    const { qrCodeId } = req.params;

    const qrCode = await QRCode.findOne({ qr_code_id: qrCodeId, user: req.user.id });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        error: { code: 'QR_NOT_FOUND', message: 'QR code not found' }
      });
    }

    // Delete scan logs first
    await ScanLog.deleteMany({ qr_code_id: qrCodeId });

    // Delete QR code
    await QRCode.deleteOne({ qr_code_id: qrCodeId });

    res.json({
      success: true,
      message: 'QR code deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get QR code statistics
 * GET /api/qr/:qrCodeId/stats
 */
exports.getQRStats = async (req, res, next) => {
  try {
    const { qrCodeId } = req.params;
    const { from, to, group_by } = req.query;

    // Check if QR exists and belongs to user
    const qrCode = await QRCode.findOne({ qr_code_id: qrCodeId, user: req.user.id });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        error: { code: 'QR_NOT_FOUND', message: 'QR code not found' }
      });
    }

    // Get statistics
    const stats = await ScanLog.getStats(qrCodeId, {
      from,
      to,
      groupBy: group_by || 'day'
    });

    res.json({
      success: true,
      data: {
        qr_code_id: qrCodeId,
        name: qrCode.name,
        ...stats
      }
    });
  } catch (error) {
    next(error);
  }
};
