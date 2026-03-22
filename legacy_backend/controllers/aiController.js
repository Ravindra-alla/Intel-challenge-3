/**
 * controllers/aiController.js
 * Optimized for low bandwidth with caching and concise responses
 */

const Chat = require('../models/Chat');
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Normalize question for cache lookup (lowercase, trim, remove extra spaces)
const normalizeQuestion = (question) => {
  return question.toLowerCase().trim().replace(/\s+/g, ' ');
};

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Question is required'
      });
    }

    // Check cache first - avoid API call if we have this question cached
    const normalizedQuestion = normalizeQuestion(question);
    let answer = null;
    let fromCache = false;
    
    try {
      const cachedChat = await Chat.findOne({ 
        normalizedQuestion: normalizedQuestion 
      }).sort({ createdAt: -1 }); // Get most recent if duplicates exist
      
      if (cachedChat) {
        // Return cached answer immediately (no API call needed)
        answer = cachedChat.answer;
        fromCache = true;
        console.log('Cache hit - returning cached answer');
      }
    } catch (cacheError) {
      console.log('Cache lookup failed, proceeding to API');
    }

    // If no cached answer, call Groq API
    if (!answer) {
      try {
        console.log('Cache miss - calling Groq API');
        
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a helpful AI tutor. Provide SHORT, CONCISE answers (2-4 sentences max). Focus on key concepts only. Avoid long explanations. Use simple language suitable for students with slow internet."
            },
            {
              role: "user",
              content: `Question: ${question}\n\nGive a brief, direct answer.`
            }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5, // Lower temperature for more consistent, concise answers
          max_completion_tokens: 1024, // Increased for complete answers
          top_p: 0.9,
          stream: false
        });
        
        answer = chatCompletion.choices[0]?.message?.content || "No response received";
        console.log('Groq API response received');
        
      } catch (aiError) {
        console.error('Groq API error:', aiError.message);
        answer = `Sorry, I couldn't answer that right now. Please try again later.`;
      }
    }

    // Save to database with normalized question for future caching
    try {
      const chat = new Chat({
        question: question.substring(0, 200), // Limit stored question length
        normalizedQuestion: normalizedQuestion.substring(0, 200),
        answer: answer.substring(0, 1000), // Limit stored answer length
        fromCache: fromCache
      });
      await chat.save();
    } catch (dbError) {
      console.log('Chat not saved to DB');
    }

    // Send minimal response
    res.status(200).json({
      answer: answer,
      cached: fromCache
    });

  } catch (error) {
    console.error('Error in askQuestion:', error);
    res.status(500).json({
      error: 'Server error'
    });
  }
};

module.exports = {
  askQuestion
};