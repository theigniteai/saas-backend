import { getOpenAIResponse } from "../services/openaiService.js";
import { generateTTS } from "../services/ttsService.js";
import { transcribeAudio } from "../utils/transcriber.js";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

let agentSettings = {
  userId: "test_user_123",
  prompt: "Hi, I am your AI Agent. How can I help you today?",
  assignedNumber: "+145154115",
  voiceId: "eleven_en_us_male",
  isEnabled: true,
};

export const getAgentSettings = (req, res) => {
  res.json(agentSettings);
};

export const updateAgentSettings = (req, res) => {
  const { userId, prompt, assignedNumber, voiceId, isEnabled } = req.body;
  if (!userId || !prompt || !assignedNumber) {
    return res.status(400).json({
      error: "userId, prompt, and assignedNumber are required.",
    });
  }

  agentSettings = { userId, prompt, assignedNumber, voiceId, isEnabled };
  res.json({ message: "Agent settings updated", agentSettings });
};

export const getCallLogs = (req, res) => {
  res.json([]);
};

export const twilioWebhookHandler = async (req, res) => {
  try {
    const twiml = new VoiceResponse();
    if (!agentSettings.isEnabled) {
      twiml.say("The AI agent is currently disabled.");
      return res.type("text/xml").send(twiml.toString());
    }

    twiml.say("Connecting you to our AI agent.");
    const gather = twiml.gather({
      input: "speech",
      action: "/ai-agent/webhook/response",
      method: "POST",
      timeout: 5,
    });
    gather.say("Please tell me how I can help you.");

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (err) {
    res.status(500).send("Internal server error");
  }
};

export const twilioWebhookResponse = async (req, res) => {
  try {
    const recordingUrl = req.body.RecordingUrl;
    if (!recordingUrl) throw new Error("Recording URL not found");

    const userSpeech = await transcribeAudio(recordingUrl);
    const replyText = await getOpenAIResponse(agentSettings.prompt, userSpeech);
    const audioUrl = await generateTTS(replyText, agentSettings.voiceId);

    const twiml = new VoiceResponse();
    twiml.play(audioUrl);

    res.type("text/xml");
    res.send(twiml.toString());
  } catch (err) {
    const twiml = new VoiceResponse();
    twiml.say("Sorry, there was a problem with the AI agent.");
    res.type("text/xml").send(twiml.toString());
  }
};
