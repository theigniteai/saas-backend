import express from "express";
import {
  getAgentSettings,
  updateAgentSettings,
  getCallLogs,
  twilioWebhookHandler,
  twilioWebhookResponse,
} from "../controllers/aiAgentController.js";

const router = express.Router();

router.get("/settings", getAgentSettings);
router.post("/settings", updateAgentSettings);
router.get("/logs", getCallLogs);
router.post("/webhook", twilioWebhookHandler);
router.post("/webhook/response", twilioWebhookResponse);

export default router;
