import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    documentType: { type: String, required: true },
    documentDate: { type: Date },
    facilityName: { type: String },
    notes: { type: String },

    // GridFS fields
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    filename: { type: String },
    contentType: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
