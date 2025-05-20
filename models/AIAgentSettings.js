import mongoose from "mongoose";

const AIAgentSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    voice: {
      type: String,
      required: true,
    },
    assignedNumber: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AIAgentSettings", AIAgentSettingsSchema);
