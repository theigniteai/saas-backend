// routes/aiAgentRoutes.js
import express from "express";
import {
  getAgentSettings,
  updateAgentSettings,
  getCallLogs,
  twilioWebhookHandler,
} from "../controllers/aiAgentController.js";

const router = express.Router();

// GET: Retrieve agent settings
router.get("/settings", getAgentSettings);

// POST: Save or update agent settings
router.post("/settings", updateAgentSettings);

// GET: Call logs for user
router.get("/logs", getCallLogs);

// POST: Handle incoming Twilio calls
router.post("/webhook", twilioWebhookHandler);

export default router;
