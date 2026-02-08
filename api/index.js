const app = require('../backend/app');
const connectDB = require('../backend/src/config/database');

// Connect to database
connectDB();

// Export the Express app as a Vercel serverless function
module.exports = app;
