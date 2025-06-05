import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
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

// ✅ CORS Configuration
app.use(cors({
  origin: ["https://saas-frontend-chi.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Static file route (for recordings)
app.use('/output', express.static(path.join(__dirname, 'output')));

// ✅ API Routes
app.use('/auth', authRoutes);
app.use('/ai', aiAssistantRoutes);
app.use('/ai-agent', aiAgentRoutes);
app.use('/clone', voiceCloneRoutes);

// ✅ Root route
app.get('/', (req, res) => {
  res.send('AccentShift Backend is running 🚀');
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
