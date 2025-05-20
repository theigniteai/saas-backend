import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import aiAssistantRoutes from './routes/aiAssistantRoutes.js';
import aiAgentRoutes from './routes/aiAgentRoutes.js';
import voiceCloneRoutes from './routes/voiceCloneRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS Fix (Paste this part correctly!)
app.use(cors({
  origin: ["https://saas-frontend-chi.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true
}));

// ✅ Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Serve audio files (like .mp3 call recordings)
app.use('/output', express.static(path.join(__dirname, 'output')));

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/ai', aiAssistantRoutes);         // POST /ai/respond
app.use('/ai-agent', aiAgentRoutes);       // /ai-agent/settings, /logs, /webhook
app.use('/clone', voiceCloneRoutes);       // /clone/voice etc.

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('AccentShift Backend is running 🚀');
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
