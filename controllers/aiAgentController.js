// controllers/aiAgentController.js
export const getAgentSettings = async (req, res) => {
  try {
    return res.json({
      prompt: "Hi, I'm your AI Agent",
      voice: "eleven_en_us_male",
      assignedNumber: "+11234567890",
      enabled: true,
    });
  } catch (error) {
    res.status(500).json({ error: "Temporary mock failed." });
  }
};

export const updateAgentSettings = async (req, res) => {
  try {
    const { prompt, voice, enabled, assignedNumber, userId } = req.body;

    if (!userId || !prompt || !assignedNumber) {
      return res.status(400).json({
        error: "userId, prompt, and assignedNumber are required.",
      });
    }

    console.log("📝 Mock saved settings:", req.body);

    // Simulate successful save
    return res.json({ message: "Mock agent settings saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Temporary mock save failed." });
  }
};

export const getCallLogs = async (req, res) => {
  try {
    return res.json([
      {
        from: "+15554443333",
        userSpeech: "What are your office hours?",
        aiReply: "We are open from 9 AM to 6 PM.",
        recordingUrl: "https://example.com/recording", // dummy link
        createdAt: new Date(),
      },
    ]);
  } catch (error) {
    res.status(500).json({ error: "Temporary mock fetch logs failed." });
  }
};

export const twilioWebhookHandler = async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say("AI Agent is currently in mock mode. Please try again later.");
  return res.type("text/xml").send(twiml.toString());
};
