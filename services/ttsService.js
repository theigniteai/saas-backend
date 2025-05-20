// services/ttsService.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const textToSpeech = require("@google-cloud/text-to-speech");
const client = new textToSpeech.TextToSpeechClient();

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;

exports.generateTTS = async (text, voiceId) => {
  try {
    // === Attempt ElevenLabs First ===
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVEN_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    const filename = `audio_${uuidv4()}.mp3`;
    const filePath = path.join(__dirname, "..", "public", filename);
    fs.writeFileSync(filePath, response.data);
    return `${process.env.BACKEND_URL}/${filename}`;
  } catch (err) {
    console.warn("ElevenLabs failed, using Google TTS fallback:", err.message);

    // === Google Cloud TTS Fallback ===
    const request = {
      input: { text },
      voice: {
        languageCode: "en-US",
        ssmlGender: "NEUTRAL",
      },
      audioConfig: {
        audioEncoding: "MP3",
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    const filename = `google_audio_${uuidv4()}.mp3`;
    const filePath = path.join(__dirname, "..", "public", filename);
    fs.writeFileSync(filePath, response.audioContent);
    return `${process.env.BACKEND_URL}/${filename}`;
  }
};
