import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import aiAssistantRoutes from './routes/aiAssistantRoutes.js';
import voiceCloneRoutes from './routes/voiceCloneRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS Configuration
app.use(cors({
  origin: '*', // Change to your frontend domain for production
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Static file serving for audio responses
app.use('/output', express.static(path.join(__dirname, 'output')));

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/ai', aiAssistantRoutes);         // handles /respond
app.use('/clone', voiceCloneRoutes);

// ✅ Root route
app.get('/', (req, res) => {
  res.send('AccentShift Backend is running 🚀');
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
