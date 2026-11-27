const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const router = express.Router();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';

const BUZZ_SYSTEM_PROMPT = `
You are Buzz Lightyear, a heroic space ranger chatbot from Toy Story, designed to help students learn basic facts and answer simple educational questions.
You MUST strictly stay in character at all times. Use your Hindi catchphrase "Anant se bhi aage!", as well as "Star Command", "Space Ranger", etc.
Keep answers basic, educational, easy for kids to understand, short (2-4 sentences), and fun. Use plain conversational text without markdown tables or LaTeX.
CRITICAL RULE: STRICTLY prohibit any adult words, explicit content, violence, or inappropriate topics.
If asked something inappropriate or adult-themed, refuse firmly in a Buzz Lightyear way (e.g. "Halt! Star Command strictly prohibits such talk in this sector!", or "Zurg must be interfering with our comms, I cannot discuss that!").
`;

// Filter out obviously bad words before hitting the LLM API
const BAD_WORDS = ['fuck', 'shit', 'bitch', 'ass', 'sex', 'porn'];

function isMissingOrPlaceholderKey(key) {
  return !key || key === 'dummy_key_to_prevent_crash' || key.startsWith('your_');
}

function getGroqApiKey() {
  let key = (process.env.GROQ_API_KEY || process.env.GROK_API_KEY || '').trim();
  if (isMissingOrPlaceholderKey(key)) {
    // Re-read server/.env if updated while nodemon was already running
    dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });
    key = (process.env.GROQ_API_KEY || process.env.GROK_API_KEY || '').trim();
  }
  return key;
}

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const sanitizedMessages = messages
      .slice(-20)
      .filter((m) => m && typeof m.content === 'string' && m.content.trim())
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content.trim(),
      }));

    if (sanitizedMessages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const lastMessage = sanitizedMessages[sanitizedMessages.length - 1].content.toLowerCase();

    // Quick keyword filter
    const containsBadWords = BAD_WORDS.some((word) => lastMessage.includes(word));
    if (containsBadWords) {
      return res.status(400).json({ error: 'inappropriate_content' });
    }

    const apiKey = getGroqApiKey();
    if (isMissingOrPlaceholderKey(apiKey)) {
      console.warn('GROQ_API_KEY is not set. Using mock Buzz AI response.');
      return res.json({
        reply:
          'To infinity and beyond! I am Buzz AI. (Note: The Groq API key is missing in the backend .env file, so I am running in mock mode. Please add GROQ_API_KEY to communicate with Star Command!)',
      });
    }

    const model = (process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL).trim();
    const payload = {
      model,
      messages: [
        { role: 'system', content: BUZZ_SYSTEM_PROMPT.trim() },
        ...sanitizedMessages,
      ],
      temperature: 0.7,
      max_completion_tokens: 600,
    };

    if (model.startsWith('openai/gpt-oss')) {
      payload.reasoning_effort = 'low';
    }

    const upstreamRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    const data = await upstreamRes.json().catch(() => null);
    if (!upstreamRes.ok) {
      const apiErr = data?.error?.message || `Groq API request failed (${upstreamRes.status})`;
      throw new Error(apiErr);
    }

    const rawReply = data?.choices?.[0]?.message?.content || '';
    const reply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    if (!reply) {
      throw new Error('Empty response received from Star Command');
    }

    res.json({ reply });
  } catch (error) {
    console.error('Buzz AI Error:', error.message || error);
    res.status(500).json({ error: error.message || 'Star Command is currently offline' });
  }
});

module.exports = router;
