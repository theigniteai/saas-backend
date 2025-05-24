import mongoose from "mongoose";

const CallLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // <-- fix here too
  from: String,
  to: String,
  userSpeech: String,
  aiReply: String,
  recordingUrl: String
}, { timestamps: true });

export default mongoose.model("CallLog", CallLogSchema);
