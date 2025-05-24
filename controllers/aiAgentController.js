// controllers/aiAgentController.js
import { getOpenAIResponse } from "../services/openaiService.js";
import { generateTTS } from "../services/ttsService.js";
import { transcribeAudio } from "../utils/transcriber.js";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

// Temporary in-memory settings
let agentSettings = {
  userId: "test_user_123",
  prompt: "Hi, I am your AI Agent. How can I help you today?",
  assignedNumber: "+145154115",
  voiceId: "eleven_en_us_male",
  isEnabled: true,
};

// Get agent settings (dummy)
export const getAgentSettings = (req, res) => {
  res.json(agentSettings);
};

// Update settings from frontend (saved in memory only)
export const updateAgentSettings = (req, res) => {
  const { userId, prompt, assignedNumber, voiceId, isEnabled } = req.body;

  if (!userId || !prompt || !assignedNumber) {
    return res.status(400).json({
      error: "userId, prompt, and assignedNumber are required.",
    });
  }

  agentSettings = { userId, prompt, assignedNumber, voiceId, isEnabled };
  res.json({ message: "Agent settings updated successfully", agentSettings });
};

// Dummy call logs for now
export const getCallLogs = (req, res) => {
  res.json([]);
};

// Twilio Webhook handler for incoming call
export const twilioWebhookHandler = async (req, res) => {
  try {
    const twiml = new VoiceResponse();

    if (!agentSettings.isEnabled) {
      twiml.say("The AI agent is currently disabled.");
      res.type("text/xml");
      return res.send(twiml.toString());
    }

    // Greeting
    twiml.say("Connecting you to our AI agent.");

    // Record caller input
    const gather = twiml.gather({
      input: "speech",
      action: "/ai-agent/webhook/response",
      method: "POST",
      timeout: 5,
    });
    gather.say("Please tell me how I can help you.");

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (error) {
    console.error("Twilio webhook error:", error);
    res.status(500).send("Internal server error");
  }
};
