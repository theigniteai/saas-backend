// models/AIAgentSettings.js
import mongoose from "mongoose";

const AIAgentSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  prompt: {
    type: String,
    required: true,
  },
  voice: {
    type: String,
    default: "eleven_en_us_male",
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  assignedNumber: {
    type: String, // Twilio number
    required: true,
  },
});

const AIAgentSettings = mongoose.model("AIAgentSettings", AIAgentSettingsSchema);
export default AIAgentSettings;
