import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import webpush from "./webPush.js";

cron.schedule("* * * * *", async () => {
  const now = new Date();

  const today = now.toISOString().split("T")[0];

  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  const reminders = await Reminder.find({ sent: false, status: true }).populate("userId")

for (let reminder of reminders) {
  const subscription = reminder.userId.subscription

  if (!subscription) continue

  await webpush.sendNotification(subscription, JSON.stringify({
    title: reminder.title,
    body: "It's time!"
  }))

  reminder.sent = true
  await reminder.save()
}
});



console.log("Scheduler running...");
