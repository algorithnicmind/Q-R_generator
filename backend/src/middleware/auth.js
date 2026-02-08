const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Ensure user is logged in
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_REQUIRED', message: 'Not authorized to access this route' }
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_FAILED', message: 'Not authorized to access this route' }
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { 
          code: 'FORBIDDEN', 
          message: `User role ${req.user.role} is not authorized to access this route`
        }
      });
    }
    next();
  };
};
