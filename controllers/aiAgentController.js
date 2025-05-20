// controllers/aiAgentController.js
import AIAgentSettings from "../models/AIAgentSettings.js";
import CallLog from "../models/CallLog.js";
import { getOpenAIResponse } from "../services/openaiService.js";
import { generateTTS } from "../services/ttsService.js";
import { transcribeAudio } from "../utils/transcriber.js";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

// ✅ Get AI Agent Settings
export const getAgentSettings = async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  const settings = await AIAgentSettings.findOne({ userId });
  res.json(settings || {});
};

// ✅ Update AI Agent Settings
export const updateAgentSettings = async (req, res) => {
  const { prompt, voice, enabled, assignedNumber } = req.body;
  const userId = req.user?.id || req.body.userId;

  const updated = await AIAgentSettings.findOneAndUpdate(
    { userId },
    { prompt, voice, enabled, assignedNumber },
    { upsert: true, new: true }
  );

  res.json({ message: "Agent updated", data: updated });
};

// ✅ Get Call Logs
export const getCallLogs = async (req, res) => {
  const userId = req.user?.id || req.query.userId;
  const logs = await CallLog.find({ userId }).sort({ createdAt: -1 });
  res.json(logs);
};

// ✅ Twilio Webhook Handler
export const twilioWebhookHandler = async (req, res) => {
  try {
    const from = req.body.From;
    const to = req.body.To;
    const recordingUrl = req.body.RecordingUrl || null;

    const agent = await AIAgentSettings.findOne({ assignedNumber: to });
    if (!agent || !agent.enabled) {
      const twiml = new VoiceResponse();
      twiml.say("The agent is currently unavailable. Please try again later.");
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
      recordingUrl,
    });

    const twiml = new VoiceResponse();
    twiml.play(audioUrl);
    return res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("AI Agent Call Error:", error.message);
    const twiml = new VoiceResponse();
    twiml.say("Sorry, an error occurred while processing the call.");
    return res.type("text/xml").send(twiml.toString());
  }
};
