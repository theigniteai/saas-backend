// services/ttsService.js
import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new TextToSpeechClient();
const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const BACKEND_URL = process.env.BACKEND_URL;

export const generateTTS = async (text, voiceId) => {
  try {
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
    return `${BACKEND_URL}/${filename}`;
  } catch (err) {
    console.warn("❗ ElevenLabs failed, using Google TTS fallback:", err.message);

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
    return `${BACKEND_URL}/${filename}`;
  }
};
