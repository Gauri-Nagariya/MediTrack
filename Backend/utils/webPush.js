import webpush from "web-push";
import dotenv from "dotenv";
dotenv.config();

webpush.setVapidDetails(
  "mailto:g2022auri@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default webpush;
