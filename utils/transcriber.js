// utils/transcriber.js
import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const transcribeAudio = async (recordingUrl) => {
  try {
    const response = await axios({
      url: `${recordingUrl}.mp3`,
      method: "GET",
      responseType: "stream",
    });

    const filename = `call_recording_${uuidv4()}.mp3`;
    const filePath = path.join(__dirname, "..", "tmp", filename);
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("model", "whisper-1");

    const transcribeRes = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    fs.unlinkSync(filePath);

    return transcribeRes.data.text;
  } catch (err) {
    console.error("Transcription error:", err.message);
    return "Sorry, we couldn't transcribe the message.";
  }
};
