import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import webpush from "./webPush.js";

const IST_TIMEZONE = "Asia/Kolkata";

const getIstDateTimeParts = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${map.hour}:${map.minute}`,
  };
};

cron.schedule("* * * * *", async () => {
  try {
    const { date: todayIst, time: currentTimeIst } = getIstDateTimeParts();

    const reminders = await Reminder.find({ sent: false, status: true }).populate(
      "userId"
    );

    for (const reminder of reminders) {
      const subscription = reminder?.userId?.subscription;
      if (!subscription) continue;

      const isDateDue = reminder.date <= todayIst;
      const isTimeDue = reminder.date < todayIst || reminder.time <= currentTimeIst;
      if (!isDateDue || !isTimeDue) continue;

      const details = [
        `Type: ${reminder.reminderType}`,
        `Date: ${reminder.date}`,
        `Time: ${reminder.time}`,
        `Reason: ${reminder.notes || "No details"}`,
      ].join("\n");

      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: reminder.title,
          body: details,
        })
      );

      reminder.sent = true;
      await reminder.save();
    }
  } catch (error) {
    console.error("Reminder scheduler error:", error.message);
  }
});

console.log("Scheduler running...");
