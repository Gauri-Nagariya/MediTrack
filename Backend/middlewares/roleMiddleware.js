import User from "../models/userModel.js";

export const requireDoctor = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "doctor") {
      return res.json({ success: false, message: "Doctor access only" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: "Authorization failed" });
  }
};

export const requirePatient = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "patient") {
      return res.json({ success: false, message: "Patient access only" });
    }
    next();
  } catch (error) {
    return res.json({ success: false, message: "Authorization failed" });
  }
};
