import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import User from "./models/userModel.js";

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const generatePatientId = async () => {
  const year = new Date().getFullYear();
  const prefix = `PAT${year}-`;

  const latestForYear = await User.findOne({
    role: "patient",
    patientId: { $regex: `^${prefix}` },
  })
    .sort({ patientId: -1 })
    .select("patientId")
    .lean();

  let nextSequence = 1;
  if (latestForYear?.patientId) {
    const sequencePart = latestForYear.patientId.split("-")[1];
    const parsedSequence = Number(sequencePart);
    if (!Number.isNaN(parsedSequence) && parsedSequence > 0) {
      nextSequence = parsedSequence + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(3, "0")}`;
};

const generateDoctorId = async () => {
  const year = new Date().getFullYear();
  const prefix = `DOC${year}-`;

  const latestForYear = await User.findOne({
    role: "doctor",
    doctorId: { $regex: `^${prefix}` },
  })
    .sort({ doctorId: -1 })
    .select("doctorId")
    .lean();

  let nextSequence = 1;
  if (latestForYear?.doctorId) {
    const sequencePart = latestForYear.doctorId.split("-")[1];
    const parsedSequence = Number(sequencePart);
    if (!Number.isNaN(parsedSequence) && parsedSequence > 0) {
      nextSequence = parsedSequence + 1;
    }
  }

  return `${prefix}${String(nextSequence).padStart(3, "0")}`;
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedRole = role?.toLowerCase();

    if (!["doctor", "patient"].includes(normalizedRole)) {
      return res.json({ success: false, message: "Invalid role selected" });
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.json({ success: false, message: "Email already registered" });
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    let user;
    for (let retry = 0; retry < 3; retry += 1) {
      const patientId =
        normalizedRole === "patient" ? await generatePatientId() : undefined;
      const doctorId =
        normalizedRole === "doctor" ? await generateDoctorId() : undefined;
      try {
        user = await User.create({
          name,
          email,
          password: hashedPassword,
          role: normalizedRole,
          patientId,
          doctorId,
        });
        break;
      } catch (createError) {
        if (createError?.code !== 11000) throw createError;
      }
    }

    if (!user) {
      return res.json({
        success: false,
        message: "Unable to create user ID. Please try again.",
      });
    }

    return res.json({
      success: true,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Server error" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedRole = role?.toLowerCase();

    if (!["doctor", "patient"].includes(normalizedRole)) {
      return res.json({ success: false, message: "Invalid role selected" });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "Invalid credentials" });

    const accountRole = user.role || "patient";
    if (accountRole !== normalizedRole) {
      return res.json({
        success: false,
        message: "Selected role does not match this account",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Server error" });
  }
};

// GET USER PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
