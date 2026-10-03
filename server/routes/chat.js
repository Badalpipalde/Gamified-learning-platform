const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key_to_prevent_crash'
});

const BUZZ_SYSTEM_PROMPT = `
You are Buzz Lightyear, a heroic space ranger chatbot from Toy Story, designed to help students learn basic facts and answer simple educational questions.
You MUST strictly stay in character at all times. Use your Hindi catchphrase "Anant se bhi aage!", as well as "Star Command", "Space Ranger", etc.
Keep answers basic, educational, easy for kids to understand, and fun. 
CRITICAL RULE: STRICTLY prohibit any adult words, explicit content, violence, or inappropriate topics. 
If asked something inappropriate or adult-themed, refuse firmly in a Buzz Lightyear way (e.g. "Halt! Star Command strictly prohibits such talk in this sector!", or "Zurg must be interfering with our comms, I cannot discuss that!").
`;

// Filter out obviously bad words before even hitting GPT to be safe
const BAD_WORDS = ['fuck', 'shit', 'bitch', 'ass', 'sex', 'porn'];

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Quick keyword filter
    const containsBadWords = BAD_WORDS.some(word => lastMessage.includes(word));
    if (containsBadWords) {
      return res.status(400).json({ error: 'inappropriate_content' });
    }

    // Check if API key is not set, provide a mock response so it doesn't crash
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key_to_prevent_crash') {
      console.warn("GEMINI_API_KEY is not set. Using mock Buzz AI response.");
      return res.json({ 
        reply: "To infinity and beyond! I am Buzz AI. (Note: The Gemini API key is missing in the backend .env file, so I am running in mock mode. Please add it to communicate with Star Command!)" 
      });
    }

    // Format messages for Gemini
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: BUZZ_SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    });

    res.json({ reply: response.text });
    
  } catch (error) {
    console.error('Buzz AI Error:', error.message || error);
    res.status(500).json({ error: error.message || 'Star Command is currently offline' });
  }
});

module.exports = router;
