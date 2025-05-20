// utils/transcriber.js
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { v4: uuidv4 } = require("uuid");

exports.transcribeAudio = async (recordingUrl) => {
  try {
    // Step 1: Download audio
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

    // Step 2: Transcribe with Whisper API
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

    // Step 3: Delete temp file
    fs.unlinkSync(filePath);

    return transcribeRes.data.text;
  } catch (err) {
    console.error("Transcription error:", err.message);
    return "Sorry, we couldn't transcribe the message.";
  }
};
