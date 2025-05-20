// routes/aiAgentRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAgentSettings,
  updateAgentSettings,
  getCallLogs,
  twilioWebhookHandler,
} = require("../controllers/aiAgentController");

// Get AI agent settings for current user
router.get("/settings", getAgentSettings);

// Update agent settings (prompt, voice, enabled)
router.post("/settings", updateAgentSettings);

// Get past call logs for current user
router.get("/logs", getCallLogs);

// Twilio will send POST request here for every call
router.post("/webhook", twilioWebhookHandler);

module.exports = router;
