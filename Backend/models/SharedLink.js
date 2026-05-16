


import mongoose from "mongoose";

const SharedLinkSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",default: null,},
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", default: null, },
  patientName: {
    type: String,default: "",},
  doctorName: {
    type: String,default: "",},
  reason: {
    type: String, default: "",},
  status: {
    type: String, enum: ["unseen", "seen"],
    default: "unseen",},
  feedback: {
    type: String, default: "",},
  direction: {
    type: String,enum: ["patient_to_doctor", "doctor_to_patient"],
    default: "patient_to_doctor",},
  reportTitle: {
    type: String,
    default: "",
  },
  reportBody: {
    type: String,
    default: "",
  },
  seenAt: {
    type: Date,
    default: null,
  },
  patientSeenAt: {
    type: Date,
    default: null,
  },
  documents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SharedLink", SharedLinkSchema);
