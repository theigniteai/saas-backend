// models/AIAgentSettings.js

import mongoose from "mongoose";

const AIAgentSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  voice: { type: String, default: "eleven_en_us_male" },
  assignedNumber: { type: String, required: true },
  enabled: { type: Boolean, default: false },
}, { timestamps: true });

// ✅ Make sure the collection name is exactly 'aiagentsettings' (lowercase)
export default mongoose.model("AIAgentSettings", AIAgentSettingsSchema, "aiagentsettings");
