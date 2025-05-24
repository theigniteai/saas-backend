// controllers/aiAgentController.js
import AIAgentSettings from "../models/AIAgentSettings.js";
import CallLog from "../models/CallLog.js";
import { getOpenAIResponse } from "../services/openaiService.js";
import { generateTTS } from "../services/ttsService.js";
import { transcribeAudio } from "../utils/transcriber.js";
import mongoose from "mongoose";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

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

export const updateAgentSettings = async (req, res) => {
  try {
    const { prompt, voice, enabled, assignedNumber, userId } = req.body;
    if (!userId || !prompt || !assignedNumber) {
      return res.status(400).json({ error: "userId, prompt, and assignedNumber are required." });
    }
    const objectId = new mongoose.Types.ObjectId(userId);
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

export const twilioWebhookHandler = async (req, res) => {
  try {
    const from = req.body.From;
    const to = req.body.To;
    const recordingUrl = req.body.RecordingUrl || null;

    const agent = await AIAgentSettings.findOne({ assignedNumber: to });
    if (!agent || !agent.enabled) {
      const twiml = new VoiceResponse();
      twiml.say("The agent is currently unavailable.");
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
  } catch (error) {
    console.error("Webhook error:", error.message);
    const twiml = new VoiceResponse();
    twiml.say("Sorry, something went wrong with the AI agent.");
    return res.type("text/xml").send(twiml.toString());
  }
};
