/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch (error) {
    return false;
  }
}

/**
 * Validate QR type
 * @param {string} type - QR type to validate
 * @returns {boolean} - True if valid type
 */
function validateQRType(type) {
  const validTypes = ['url', 'form', 'video', 'document'];
  return validTypes.includes(type);
}

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.trim().replace(/[<>]/g, '');
}

module.exports = {
  validateUrl,
  validateQRType,
  sanitizeString
};
