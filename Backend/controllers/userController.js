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

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.json({ success: false, message: "Email already registered" });
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

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
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "Invalid credentials" });

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
