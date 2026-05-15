import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["doctor", "patient"],
      default: "patient",
      required: true,
    },
    patientId: {
      type: String,
      trim: true,
      default: undefined,
      unique: true,
      sparse: true,
    },
    doctorId: {
      type: String,
      trim: true,
      default: undefined,
      unique: true,
      sparse: true,
    },
    subscription: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
