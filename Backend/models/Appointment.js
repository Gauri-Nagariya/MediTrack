



import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    patientBookingId: {
      type: String,
      trim: true,
      default: undefined,
      index: true,
    },
    appointmentPublicId: {
      type: String,
      trim: true,
      default: undefined,
      unique: true,
      sparse: true,
    },
    patientName: { type: String, required: true, trim: true },
    patientEmail: { type: String, trim: true, default: "" },
    appointmentDate: { type: Date, required: true },
    reason: { type: String, trim: true, default: "" },
    patientDeleted: { type: Boolean, default: false },
    doctorDeleted: { type: Boolean, default: false },
    doctorStatusReason: { type: String, trim: true, default: "" },
    patientStatusReason: { type: String, trim: true, default: "" },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "done", "rejected", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
