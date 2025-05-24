import express from "express";
import {
  getAgentSettings,
  updateAgentSettings,
  getCallLogs,
  twilioWebhookHandler,
  twilioWebhookResponse,
  startOutboundCall, // ✅ Outbound call trigger
} from "../controllers/aiAgentController.js";

const router = express.Router();

// Get settings from memory (mock user)
router.get("/settings", getAgentSettings);

// Update settings
router.post("/settings", updateAgentSettings);

// Get dummy logs
router.get("/logs", getCallLogs);

// Twilio incoming call webhook
router.post("/webhook", twilioWebhookHandler);

// Twilio follow-up: get caller input → transcribe + reply
router.post("/webhook/response", twilioWebhookResponse);

// Dashboard: trigger AI agent outbound call
router.post("/start-call", startOutboundCall);

export default router;
