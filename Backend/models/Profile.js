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
  emailId: String,
  // phone: String,
  phone: {
  type: String,
  required: true,
  match: /^[0-9]{10}$/
},
  emergencyContactNumber: String,
  address: String,
  insuranceDetails: String,
  medicalHistory: String,
  currentMedications: String,
  medicalReportsUpload: String,
  doctorPrescriptions: String,
  appointmentHistory: String,
  vaccinationRecords: String,
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

  // Doctor profile fields
  doctorGender: {
    type: String,
    enum: ["Male", "Female", "Other", ""],
    default: "",
  },
  doctorDateOfBirth: Date,
  languagesSpoken: [String],
  specialization: String,
  degreesQualifications: String,
  medicalLicenseNumber: String,
  yearsOfExperience: Number,
  hospitalClinicName: String,
  currentPosition: String,
  doctorEmail: String,
  doctorPhone: String,
  clinicAddress: String,
  cityState: String,
  workingDays: [String],
  consultationTimings: String,
  consultationMode: {
    type: String,
    enum: ["Online", "Offline", "Both", ""],
    default: "",
  },
  emergencyAvailability: {
    type: String,
    enum: ["Yes", "No", ""],
    default: "",
  },
  consultationFees: Number,
  servicesOffered: [String],
  acceptedInsurance: [String],
  shortBio: String,
  achievementsCertifications: String,
  medicalCertificate: String,
  licenseUpload: String,
  idProof: String,
},{ timestamps: true });

export default mongoose.model("Profile", profileSchema);
