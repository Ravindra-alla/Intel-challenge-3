/**
 * models/Chat.js
 * Chat Model File - Optimized for caching and low bandwidth
 */

const mongoose = require('mongoose');

/**
 * Chat Schema Definition
 * Defines the structure of a chat document in MongoDB with caching support
 */
const chatSchema = new mongoose.Schema({
  // The user's original question text
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200 // Limit stored length
  },

  // Normalized version for cache lookup (lowercase, trimmed)
  normalizedQuestion: {
    type: String,
    required: false,
    trim: true,
    maxlength: 200,
    index: true // Add index for faster cache lookups
  },

  // The AI's answer text
  answer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000 // Limit stored length for bandwidth
  },

  // Whether this answer was served from cache
  fromCache: {
    type: Boolean,
    default: false
  },

  // Automatically set to the date/time when the document is created
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // Auto-delete after 30 days (TTL index)
  }
});

// Create the Chat model from the schema
const Chat = mongoose.model('Chat', chatSchema);

// Export the Chat model for use in controllers
module.exports = Chat;
