import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

import reminderRoutes from "./routes/reminderRoutes.js";
import Reminder from "./models/Reminder.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// connect DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log("❌ DB error:", err));

// routes
app.use("/api/reminders", reminderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// cron job to check due reminders
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const dueReminders = await Reminder.find({
    time: { $lte: now },
    notified: false
  });

  for (let reminder of dueReminders) {
    console.log("⏰ Reminder due:", reminder.title);
    reminder.notified = true;
    await reminder.save();
  }
});
