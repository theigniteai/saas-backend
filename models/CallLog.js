// models/CallLog.js
const mongoose = require("mongoose");

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

module.exports = mongoose.model("CallLog", CallLogSchema);
