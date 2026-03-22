/**
 * config/db.js
 * Database Configuration File
 * 
 * This file:
 * - Establishes connection to MongoDB using Mongoose
 * - Uses the MONGO_URI environment variable from .env file
 * - Handles connection success and error events
 * - Exports the connection function for use in server.js
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses the MONGO_URI from environment variables
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the connection string
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options ensure proper connection handling
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    // Log successful connection with host information
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log error if connection fails
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Throw error to be handled by caller (server.js)
    throw error;
  }
};

// Export the connection function for use in other files
module.exports = connectDB;
