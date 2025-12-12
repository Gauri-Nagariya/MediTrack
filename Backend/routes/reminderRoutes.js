import express from "express";
import Reminder from "../models/Reminder.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import User from "../models/userModel.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.create({
      ...req.body,
      userId: req.userId,
      sent: false,
    });

    res.status(201).json({ success: true, reminder });
  } catch (error) {
    console.error("SAVE ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, reminders });
  } catch (error) {
    console.error("FETCH ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    res.json({ success: true, message: "Reminder deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/subscribe", authMiddleware, async (req, res) => {
  try {
    const subscription = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription object",
      });
    }

    await User.findByIdAndUpdate(req.userId, {
      subscription,
    });

    res.json({ success: true, message: "Subscription saved" });
  } catch (err) {
    console.error("SUBSCRIBE ERROR:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
