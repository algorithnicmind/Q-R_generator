const User = require('../models/User');

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: 'Email already exists' }
      });
    }
    next(error);
  }
};

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Please provide an email and password' }
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    //.cookie('token', token, options) // Optional: Use cookies if preferred
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};
