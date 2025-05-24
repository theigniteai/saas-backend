import mongoose from "mongoose";

const AIAgentSettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // <-- fix here
  prompt: { type: String, required: true },
  voice: { type: String, default: "eleven_en_us_male" },
  assignedNumber: { type: String, required: true },
  enabled: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("AIAgentSettings", AIAgentSettingsSchema, "aiagentsettings");
