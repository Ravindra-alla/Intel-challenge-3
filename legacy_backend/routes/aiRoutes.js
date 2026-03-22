/**
 * routes/aiRoutes.js
 * AI Routes Configuration File
 * 
 * This file:
 * - Defines all routes related to AI tutor functionality
 * - Maps HTTP endpoints to their corresponding controller functions
 * - Currently includes the /ask endpoint for processing questions
 * - All routes are prefixed with /api in server.js
 */

const express = require('express');

// Create a new Express router instance
const router = express.Router();

// Import controller functions
const { askQuestion } = require('../controllers/aiController');

/**
 * POST /api/ask
 * Route for submitting a question to the AI tutor
 * 
 * Request Body:
 * - question: string (the user's question)
 * 
 * Response:
 * - answer: string (the AI's response)
 */
router.post('/ask', askQuestion);

// Export the router for use in server.js
module.exports = router;
