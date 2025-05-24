// controllers/aiAgentController.js
import AIAgentSettings from "../models/AIAgentSettings.js";
import CallLog from "../models/CallLog.js"; // Optional for logs
import { getOpenAIResponse } from "../services/openaiService.js"; // Optional
import { generateTTS } from "../services/ttsService.js"; // Optional
import { transcribeAudio } from "../utils/transcriber.js"; // Optional
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

// ✅ Get Agent Settings
export const getAgentSettings = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || "demo-user";
    const settings = await AIAgentSettings.findOne({ userId });
    res.json(settings || {});
  } catch (err) {
    console.error("Fetch settings error:", err.message);
    res.status(500).json({ error: "Failed to fetch agent settings." });
  }
};

// ✅ Update Agent Settings
export const updateAgentSettings = async (req, res) => {
  try {
    const { prompt, voice, assignedNumber, enabled, userId } = req.body;

    if (!prompt || !assignedNumber || !userId) {
      return res.status(400).json({ error: "userId, prompt, and assignedNumber are required." });
    }

    const updated = await AIAgentSettings.findOneAndUpdate(
      { userId },
      { prompt, voice, assignedNumber, enabled },
      { upsert: true, new: true }
    );

    res.json({ message: "Agent updated successfully", data: updated });
  } catch (err) {
    console.error("Agent update error:", err.message);
    res.status(500).json({ error: "Internal server error while saving agent settings." });
  }
};

// ✅ Get Call Logs (optional)
export const getCallLogs = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || "demo-user";
    const logs = await CallLog.find({ userId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error("Fetch logs error:", err.message);
    res.status(500).json({ error: "Failed to fetch call logs." });
  }
};

// ✅ Twilio Webhook (optional)
export const twilioWebhookHandler = async (req, res) => {
  try {
    const from = req.body.From;
    const to = req.body.To;
    const recordingUrl = req.body.RecordingUrl || null;

    const agent = await AIAgentSettings.findOne({ assignedNumber: to });
    if (!agent || !agent.enabled) {
      const twiml = new VoiceResponse();
      twiml.say("The AI agent is currently disabled.");
      return res.type("text/xml").send(twiml.toString());
    }

    const userSpeech = await transcribeAudio(recordingUrl);
    const aiReply = await getOpenAIResponse(agent.prompt, userSpeech);
    const audioUrl = await generateTTS(aiReply, agent.voice);

    await CallLog.create({
      userId: agent.userId,
      from,
      to,
      userSpeech,
      aiReply,
      recordingUrl
    });

    const twiml = new VoiceResponse();
    twiml.play(audioUrl);
    return res.type("text/xml").send(twiml.toString());
  } catch (err) {
    console.error("Twilio webhook error:", err.message);
    const twiml = new VoiceResponse();
    twiml.say("Something went wrong with the AI agent.");
    return res.type("text/xml").send(twiml.toString());
  }
};
