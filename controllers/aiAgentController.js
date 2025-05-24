// controllers/aiAgentController.js
import AIAgentSettings from "../models/AIAgentSettings.js";
import CallLog from "../models/CallLog.js";
import { getOpenAIResponse } from "../services/openaiService.js";
import { generateTTS } from "../services/ttsService.js";
import { transcribeAudio } from "../utils/transcriber.js";
import mongoose from "mongoose";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

// ✅ GET Agent Settings
export const getAgentSettings = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const objectId = new mongoose.Types.ObjectId(userId);
    const settings = await AIAgentSettings.findOne({ userId: objectId });
    res.json(settings || {});
  } catch (error) {
    console.error("Fetch settings error:", error.message);
    res.status(500).json({ error: "Failed to fetch settings." });
  }
};

// ✅ POST Agent Settings (Saving agent settings)
export const updateAgentSettings = async (req, res) => {
  try {
    const { prompt, voice, enabled, assignedNumber, userId } = req.body;

    if (!prompt?.trim() || !assignedNumber?.trim() || !userId?.trim()) {
      return res.status(400).json({ error: "userId, prompt, and assignedNumber are required." });
    }

    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(userId);
    } catch (err) {
      return res.status(400).json({ error: "Invalid userId format." });
    }

    const updated = await AIAgentSettings.findOneAndUpdate(
      { userId: objectId },
      { prompt, voice, enabled, assignedNumber },
      { upsert: true, new: true }
    );

    res.json({ message: "Agent updated", data: updated });
  } catch (error) {
    console.error("Agent update error:", error.message);
    res.status(500).json({ error: "Internal server error while saving agent settings." });
  }
};

// ✅ GET Call Logs
export const getCallLogs = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const objectId = new mongoose.Types.ObjectId(userId);
    const logs = await CallLog.find({ userId: objectId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    console.error("Fetch logs error:", error.message);
    res.status(500).json({ error: "Failed to fetch call logs." });
  }
};

// ✅ Webhook for Twilio (Receive call and respond)
export const twilioWebhookHandler = async (req, res) => {
  try {
    const from = req.body.From;
    const to = req.body.To;
    const recordingUrl = req.body.RecordingUrl || null;

    console.log("Incoming call from:", from, "to:", to);

    const agent = await AIAgentSettings.findOne({ assignedNumber: to });

    if (!agent || !agent.enabled) {
      const twiml = new VoiceResponse();
      twiml.say("The agent is currently unavailable.");
      return res.type("text/xml").send(twiml.toString());
    }

    const userSpeech = await transcribeAudio(recordingUrl);
    console.log("User said:", userSpeech);

    const aiReply = await getOpenAIResponse(agent.prompt, userSpeech);
    console.log("AI replied:", aiReply);

    const audioUrl = await generateTTS(aiReply, agent.voice);
    console.log("TTS Audio URL:", audioUrl);

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
  } catch (error) {
    console.error("Webhook error:", error.message);
    const twiml = new VoiceResponse();
    twiml.say("Sorry, something went wrong with the AI agent.");
    return res.type("text/xml").send(twiml.toString());
  }
};
