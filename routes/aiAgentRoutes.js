// routes/aiAgentRoutes.js
import express from "express";
import {
  getAgentSettings,
  updateAgentSettings,
  getCallLogs,
  twilioWebhookHandler,
} from "../controllers/aiAgentController.js";

const router = express.Router();

// Get AI agent settings (hardcoded response for now)
router.get("/settings", getAgentSettings);

// Update agent settings (temporarily save in memory)
router.post("/settings", updateAgentSettings);

// Get call logs (dummy array for now)
router.get("/logs", getCallLogs);

// Handle inbound Twilio call
router.post("/webhook", twilioWebhookHandler);

export default router;
