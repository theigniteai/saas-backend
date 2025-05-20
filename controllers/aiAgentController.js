// controllers/aiAgentController.js
const AIAgentSettings = require("../models/AIAgentSettings");
const CallLog = require("../models/CallLog");
const { getOpenAIResponse } = require("../services/openaiService");
const { generateTTS } = require("../services/ttsService");
const { transcribeAudio } = require("../utils/transcriber");
const VoiceResponse = require("twilio").twiml.VoiceResponse;

// Get AI Agent Settings
exports.getAgentSettings = async (req, res) => {
  const userId = req.user.id;
  const settings = await AIAgentSettings.findOne({ userId });
  res.json(settings || {});
};

// Update Agent Settings
exports.updateAgentSettings = async (req, res) => {
  const { prompt, voice, enabled } = req.body;
  const userId = req.user.id;

  const updated = await AIAgentSettings.findOneAndUpdate(
    { userId },
    { prompt, voice, enabled },
    { upsert: true, new: true }
  );

  res.json({ message: "Agent updated", data: updated });
};

// Get User Call Logs
exports.getCallLogs = async (req, res) => {
  const userId = req.user.id;
  const logs = await CallLog.find({ userId }).sort({ createdAt: -1 });
  res.json(logs);
};

// Twilio Webhook for Incoming Call
exports.twilioWebhookHandler = async (req, res) => {
  try {
    const from = req.body.From;
    const to = req.body.To;
    const recordingUrl = req.body.RecordingUrl || null;

    // Step 1: Get user based on Twilio number
    const agent = await AIAgentSettings.findOne({ assignedNumber: to });
    if (!agent || !agent.enabled) {
      const twiml = new VoiceResponse();
      twiml.say("The agent is currently unavailable. Please try again later.");
      return res.type("text/xml").send(twiml.toString());
    }

    // Step 2: Transcribe caller's voice
    const userSpeech = await transcribeAudio(recordingUrl);

    // Step 3: Get AI Response from OpenAI
    const aiReply = await getOpenAIResponse(agent.prompt, userSpeech);

    // Step 4: Generate Voice using ElevenLabs or Google TTS
    const audioUrl = await generateTTS(aiReply, agent.voice);

    // Step 5: Log the call
    await CallLog.create({
      userId: agent.userId,
      from,
      to,
      userSpeech,
      aiReply,
      recordingUrl,
    });

    // Step 6: Send TWiML Response to play audio
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
