import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import webpush from "web-push";
import reminderRoutes from "./routes/reminderRoutes.js";
import recordRoutes from "./routes/RecordRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import User from "./models/userModel.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
// console.log("MONGO_URI =>", process.env.MONGO_URI);
connectDB();
import "./utils/scheduler.js";



const app = express();
// app.use(cors());
// allow frontend to access backend

const allowedOrigins = [
  "http://localhost:5173",                 // development
  "https://meditrack-black.vercel.app"     // production
];


// app.use(cors({
//   origin: "http://localhost:5173", // Vite frontend port
//   credentials: true,
// }));


app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman or server-to-server requests
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error("CORS not allowed"), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));


app.use(express.json());


webpush.setVapidDetails(
    "mailto:example@gmail.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);


app.get("/test-push", async (req, res) => {
  try {
    const user = await User.findOne({ subscription: { $ne: null } });

    if (!user) return res.send("No subscribed user found");

    await webpush.sendNotification(
      user.subscription,
      JSON.stringify({
        title: "Reminder",
        body: "Time for medicine!"
      })
    );

    res.send("✅ Push sent successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Push failed");
  }
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => res.send("Backend is running fine!"));

// app.use("/api", recordRoutes);
// app.use("/uploads", express.static(uploadDir));
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/documents", recordRoutes);
app.use("/api/share", shareRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// recorroutes , server.js upload.js 
// fs mdoule is used in these files 