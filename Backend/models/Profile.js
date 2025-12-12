import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  // userId: { type: String, required: true, unique: true },
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  unique: true
},

  fullName: String,
  dateOfBirth: Date,
  // gender: String,
  gender: {
  type: String,
  enum: ["Male", "Female", "Other"]
},
  // bloodGroup: String,
  bloodGroup: {
  type: String,
  enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
},
  height: Number,
  weight: Number,
  profilePhoto: String,
  // phone: String,
  phone: {
  type: String,
  required: true,
  match: /^[0-9]{10}$/
},
  address: String,
  // emergencyContactName: String,
  // emergencyContactPhone: String,
  emergencyContacts: [
  {
    name: { type: String, required: true },
    phone: { type: String, required: true }
  }
],

  // Medical Info
  allergies: [String],
  chronicConditions: [String],
  medications: [String],
  surgeries: [String],
  familyHistory: [String],
  disabilities: [String],
  healthId: String,
  preferredHospital: String,
},{ timestamps: true });

export default mongoose.model("Profile", profileSchema);
