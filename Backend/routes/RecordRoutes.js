import express from "express";
import mongoose from "mongoose";
import upload from "../middlewares/upload.js";
import Document from "../models/Document.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Get GridFS bucket
function getBucket() {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB not connected");
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
}

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const bucket = getBucket();
    const { originalname, buffer, mimetype } = req.file;

    const uploadStream = bucket.openUploadStream(originalname, {
      contentType: mimetype,
      metadata: { uploadedAt: new Date() },
    });

    uploadStream.end(buffer);

    uploadStream.on("error", (err) => {
      console.error(err);
      return res.status(500).json({ error: "Upload failed" });
    });

    uploadStream.on("finish", async () => {
      const newDoc = new Document({
        documentType: req.body.documentType,
        documentDate: req.body.documentDate,
        facilityName: req.body.facilityName,
        notes: req.body.notes,
        fileId: uploadStream.id,
        filename: originalname,
        contentType: mimetype,
      });

      await newDoc.save();

      res.json({
        success: true,
        message: "File saved in MongoDB GridFS ✅",
        document: newDoc,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/prescriptions", async (req, res) => {
  try {
    const prescriptions = await Document.find({ documentType: "Prescription" });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/TestReports", async (req, res) => {
  try {
    const TestReports = await Document.find({ documentType: "Report" });
    res.json(TestReports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/bills", async (req, res) => {
  try {
    const bills = await Document.find({ documentType: "Bill" });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/medicalRecords", async (req, res) => {
  try {
    const prescriptions = await Document.find({ documentType: "Scan / X-Ray" });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/file/:docId", async (req, res) => {
  try {
    const { docId } = req.params;
    const download = req.query.download === "true";

    if (!ObjectId.isValid(docId))
      return res.status(400).send("Invalid document id");

    const doc = await Document.findById(docId);
    if (!doc) return res.status(404).send("Document not found");

    const bucket = getBucket();

    let fileId;
    try {
      fileId = new ObjectId(doc.fileId);
    } catch {
      return res.status(404).send("Invalid GridFS fileId");
    }

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on("error", () =>
      res.status(404).send("File not found in GridFS")
    );

    // Determine content type for viewing
    let contentType = doc.contentType;

    // fallback based on extension
    if (!contentType) {
      const ext = doc.filename.split(".").pop().toLowerCase();
      if (ext === "pdf") contentType = "application/pdf";
      else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
      else if (ext === "png") contentType = "image/png";
      else if (ext === "txt") contentType = "text/plain";
      else contentType = "application/octet-stream";
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `${download ? "attachment" : "inline"}; filename="${
        doc.filename || "file"
      }"`
    );
    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const bucket = getBucket();

    // Use new ObjectId to delete GridFS file
    try {
      await bucket.delete(new ObjectId(doc.fileId));
    } catch (err) {
      console.error("Failed to delete GridFS file:", err.message);
      // continue to delete document even if file deletion fails
    }

    await Document.findByIdAndDelete(id);

    res.json({ message: "Document and file deleted ✅" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
