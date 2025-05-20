// models/AIAgentSettings.js
const mongoose = require("mongoose");

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

module.exports = mongoose.model("AIAgentSettings", AIAgentSettingsSchema);
