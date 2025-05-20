// models/CallLog.js
import mongoose from "mongoose";

const CallLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    from: String,
    to: String,
    userSpeech: String,
    aiReply: String,
    recordingUrl: String,
  },
  { timestamps: true }
);

const CallLog = mongoose.model("CallLog", CallLogSchema);
export default CallLog;
