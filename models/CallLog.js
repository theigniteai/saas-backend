// models/CallLog.js
import mongoose from "mongoose";

const CallLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  userSpeech: { type: String },
  aiReply: { type: String },
  recordingUrl: { type: String },
}, { timestamps: true });

export default mongoose.model("CallLog", CallLogSchema, "calllogs");
