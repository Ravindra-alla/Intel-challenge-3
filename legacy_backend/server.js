/**
 * server.js
 * Main entry point for the AI Tutor Backend Application
 * Optimized for low bandwidth environments
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');

// Load environment variables from .env file
dotenv.config();

// Import database connection function
const connectDB = require('./config/db');

// Import route files
const aiRoutes = require('./routes/aiRoutes');

// Initialize Express application
const app = express();

// Enable gzip compression for all responses (reduces data transfer by 70-80%)
app.use(compression({
  level: 6, // Balanced compression level (1-9)
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Enable CORS for all origins (allows frontend to communicate with backend)
app.use(cors());

// Enable JSON body parsing with strict limits
app.use(express.json({ 
  limit: '10kb' // Limit request body size to prevent large payloads
}));

// Add security headers for performance
app.use((req, res, next) => {
  // Prevent caching of API responses to ensure fresh data
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

// Connect to MongoDB database (optional - server works without it)
connectDB().catch(err => {
  console.log('MongoDB not connected - running without database');
});

// Register API routes under /api prefix
app.use('/api', aiRoutes);

// Lightweight health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'AI Tutor API is running',
    timestamp: new Date().toISOString()
  });
});

// Define the port to run the server on
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
