import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  time: { type: Date, required: true },
  notified: { type: Boolean, default: false }
});

export default mongoose.model("Reminder", reminderSchema);
