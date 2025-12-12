import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    notes: String,
    reminderType: { type: String, required: true },

    date: { type: String, required: true },
    time: { type: String, required: true },

    status: { type: Boolean, default: true },
    sent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", reminderSchema);
