// routes/aiAgentRoutes.js
import express from "express";
import {
  getAgentSettings,
  updateAgentSettings,
  getCallLogs,
  twilioWebhookHandler,
} from "../controllers/aiAgentController.js";

const router = express.Router();

// ✅ Get AI Agent Settings
router.get("/settings", getAgentSettings);

// ✅ Update AI Agent Settings
router.post("/settings", updateAgentSettings);

// ✅ Get Call Logs
router.get("/logs", getCallLogs);

// ✅ Handle Incoming Twilio Call
router.post("/webhook", twilioWebhookHandler);

export default router;
