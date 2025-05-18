import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google TTS client (fallback if needed)
const gcpClient = new TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
});

// POST /ai/respond
router.post('/respond', async (req, res) => {
  const { text, accent = 'us' } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Missing prompt text' });
  }

  try {
    // Step 1: Generate AI reply using OpenAI
    const openaiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const aiReply = openaiRes.data.choices[0].message.content;
    console.log('🤖 AI Reply:', aiReply);

    // Step 2: Convert reply to voice using ElevenLabs
    const elevenVoiceMap = {
      us: 'EXAVITQu4vr4xnSDxMaL',      // US
      uk: 'ErXwobaYiN019PkySvjV',      // UK
      aus: 'MF3mGyEYCl7XYWbV9V6O',     // AUS
      ind: 'TX3LPaxmHKxFdv7VOQHJ',     // India (custom or fallback to US)
    };

    const voiceId = elevenVoiceMap[accent] || elevenVoiceMap.us;

    const elevenRes = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: aiReply,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': elevenRes.data.length,
    });

    res.send(elevenRes.data);
  } catch (err) {
    console.error('❌ AI Agent Error:', err.message);
    res.status(500).json({ error: 'AI Agent failed', message: err.message });
  }
});

export default router;
