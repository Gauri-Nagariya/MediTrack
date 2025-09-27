import express from "express";
import Reminder from "../models/Reminder.js";

const router = express.Router();

// create reminder
router.post("/", async (req, res) => {
  try {
    const reminder = new Reminder(req.body);
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get all reminders
router.get("/", async (req, res) => {
  const reminders = await Reminder.find();
  res.json(reminders);
});

// delete reminder
router.delete("/:id", async (req, res) => {
  await Reminder.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
