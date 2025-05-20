// routes/aiAgentRoutes.js
import express from "express";
import {
  getAgentSettings,
  updateAgentSettings,
  getCallLogs,
  twilioWebhookHandler,
} from "../controllers/aiAgentController.js"; // 👈 Add .js

const router = express.Router();

// Get AI agent settings for current user
router.get("/settings", getAgentSettings);

// Update agent settings (prompt, voice, enabled)
router.post("/settings", updateAgentSettings);

// Get past call logs for current user
router.get("/logs", getCallLogs);

// Twilio will send POST request here for every call
router.post("/webhook", twilioWebhookHandler);

export default router;
