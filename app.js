// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import aiAgentRoutes from "./routes/aiAgentRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for TTS audio playback
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/ai-agent", aiAgentRoutes);

// Root
app.get("/", (req, res) => {
  res.send("AI Calling Agent Server Running");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
