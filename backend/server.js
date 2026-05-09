// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Security Headers for Browser Compatibility
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self' http://localhost:3000; style-src 'self' 'unsafe-inline';");
  next();
});

// Root endpoint for status check
app.get('/', (req, res) => {
  res.send(`
    <body style="background: #0f172a; color: #f8fafc; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
      <div style="text-align: center; border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; background: rgba(30, 41, 59, 0.5); backdrop-filter: blur(10px);">
        <h1 style="background: linear-gradient(to right, #60a5fa, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">EchoSub Bridge Active</h1>
        <p style="color: #94a3b8; margin-top: 10px;">Your local AI movie assistant is ready.</p>
        <div style="margin-top: 20px; font-size: 12px; color: #3b82f6; font-weight: bold;">PORT 3000</div>
      </div>
    </body>
  `);
});

// Suppress Chrome DevTools 404 noise
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({ success: true });
});

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3'; // Default to llama3, can be configurable

// Simple In-Memory Cache
const aiCache = new Map();

// Mock Dictionary for Phase 1 (Legacy / Fast Fallback)
const mockDictionary = {
  "screwed": {
    word: "screwed",
    meaning: "In a difficult or hopeless situation; messed up.",
    explanation: "Used when someone has made a big mistake or is in trouble.",
    example: "He screwed up big time by missing the deadline."
  },
  "scene": {
    word: "scene",
    meaning: "A sequence of continuous action in a play, movie, or book.",
    explanation: "A specific part of a movie, like the one you are watching now.",
    example: "That opening scene was incredible!"
  }
};

app.get('/dictionary', (req, res) => {
  const word = req.query.word?.toLowerCase();
  console.log(`Lookup: ${word}`);
  
  if (mockDictionary[word]) {
    return res.json(mockDictionary[word]);
  }
  
  // Generic fallback if not in mock
  res.json({
    word: word,
    meaning: "Native meaning logic will be fully automated via AI in Phase 2.",
    explanation: "EchoSub is connecting to your local Ollama instance for contextual definitions.",
    example: "Example sentence using " + word
  });
});

app.post('/simplify', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).send("No text provided");

  const cacheKey = `simplify:${text}`;
  if (aiCache.has(cacheKey)) return res.json({ simplified: aiCache.get(cacheKey) });

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      body: JSON.stringify({
        model: MODEL,
        prompt: `Convert this movie subtitle into simple, easy-to-understand English. Keep it short. Original: "${text}" Simplified:`,
        stream: false
      })
    });
    const data = await response.json();
    const simplified = data.response.trim();
    aiCache.set(cacheKey, simplified);
    res.json({ simplified });
  } catch (error) {
    console.error("Ollama Error:", error);
    res.status(500).json({ simplified: text, error: "Ollama not reachable" });
  }
});

app.post('/explain', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).send("No text provided");

  const cacheKey = `explain:${text}`;
  if (aiCache.has(cacheKey)) return res.json({ explanation: aiCache.get(cacheKey) });

  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      body: JSON.stringify({
        model: MODEL,
        prompt: `Explain the context and meaning of this movie line for a non-native speaker: "${text}". Keep it to 2 short sentences.`,
        stream: false
      })
    });
    const data = await response.json();
    const explanation = data.response.trim();
    aiCache.set(cacheKey, explanation);
    res.json({ explanation });
  } catch (error) {
    console.error("Ollama Error:", error);
    res.status(500).json({ explanation: "Unable to reach AI engine.", error: "Ollama not reachable" });
  }
});

app.post('/tts', async (req, res) => {
  const { text } = req.body;
  // This will eventually call Coqui TTS local server
  console.log(`TTS Request: ${text}`);
  res.json({ success: true, message: "Coqui TTS module ready for integration." });
});

app.listen(PORT, () => {
  console.log(`EchoSub AI Bridge running at http://localhost:${PORT}`);
});
