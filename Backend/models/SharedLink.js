import mongoose from "mongoose";

const SharedLinkSchema = new mongoose.Schema({
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
    expires: 24 * 60 * 60, // (optional) auto-delete after 24h
  },
});

export default mongoose.model("SharedLink", SharedLinkSchema);
