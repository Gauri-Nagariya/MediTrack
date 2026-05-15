import express from "express";
import SharedLink from "../models/SharedLink.js";
import Document from "../models/Document.js";
import User from "../models/userModel.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { requireDoctor, requirePatient } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Create a new shared link (POST /api/share)
router.post("/", async (req, res) => {
  const { documentIds } = req.body;

  if (!documentIds || documentIds.length === 0) {
    return res.status(400).json({ message: "No documents selected" });
  }

  try {
    const shared = new SharedLink({
      documents: documentIds,
    });

    await shared.save();

    // Send back full URL for QR code
    const link = `${req.protocol}://${req.get("host")}/shared/${shared._id}`;

    res.json({ link });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all documents from a shared link (GET /api/share/:id)
router.get("/:id", async (req, res) => {
  try {
    const shared = await SharedLink.findById(req.params.id).populate(
      "documents"
    );

    if (!shared) {
      return res.status(404).json({ message: "Shared link not found" });
    }

    res.json({ documents: shared.documents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/to-doctor", authMiddleware, requirePatient, async (req, res) => {
  try {
    const { documentIds, doctorId, reason } = req.body;
    const normalizedReason = String(reason || "").trim();
    if (!Array.isArray(documentIds) || !documentIds.length) {
      return res.json({ success: false, message: "No documents selected" });
    }
    if (!doctorId) {
      return res.json({ success: false, message: "Doctor is required" });
    }
    if (!normalizedReason) {
      return res.json({ success: false, message: "Reason is required" });
    }

    const [patient, doctor] = await Promise.all([
      User.findById(req.userId).select("name"),
      User.findOne({ _id: doctorId, role: "doctor" }).select("name"),
    ]);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const share = await SharedLink.create({
      patientId: req.userId,
      doctorId,
      patientName: patient?.name || "Patient",
      doctorName: doctor?.name || "Doctor",
      reason: normalizedReason,
      documents: documentIds,
      status: "unseen",
      direction: "patient_to_doctor",
    });

    return res.json({ success: true, share });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.get("/doctor/patients", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const links = await SharedLink.find({ doctorId: req.userId }).select(
      "patientId patientName"
    );
    const patientMap = new Map();
    links.forEach((item) => {
      const key = String(item.patientId || "");
      if (!key) return;
      if (!patientMap.has(key)) {
        patientMap.set(key, {
          _id: item.patientId,
          name: item.patientName || "Patient",
        });
      }
    });
    return res.json({ success: true, patients: Array.from(patientMap.values()) });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.post("/to-patient", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const { patientId, reportTitle, reportBody } = req.body;
    const title = String(reportTitle || "").trim();
    const body = String(reportBody || "").trim();
    if (!patientId) return res.json({ success: false, message: "Patient is required" });
    if (!title && !body) {
      return res.json({ success: false, message: "Report details are required" });
    }

    const [doctor, patient] = await Promise.all([
      User.findById(req.userId).select("name"),
      User.findOne({ _id: patientId, role: "patient" }).select("name"),
    ]);
    if (!patient) return res.json({ success: false, message: "Patient not found" });

    const share = await SharedLink.create({
      patientId,
      doctorId: req.userId,
      patientName: patient.name || "Patient",
      doctorName: doctor?.name || "Doctor",
      reason: "Doctor report shared",
      documents: [],
      status: "seen",
      patientSeenAt: null,
      direction: "doctor_to_patient",
      reportTitle: title,
      reportBody: body,
    });

    return res.json({ success: true, share });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.get("/patient/history", authMiddleware, requirePatient, async (req, res) => {
  try {
    const shares = await SharedLink.find({ patientId: req.userId })
      .populate("documents")
      .sort({ createdAt: -1 });
    return res.json({ success: true, shares });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.get("/doctor/inbox", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const shares = await SharedLink.find({ doctorId: req.userId })
      .populate("documents")
      .sort({ createdAt: -1 });
    return res.json({ success: true, shares });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.get("/doctor/unseen-count", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const count = await SharedLink.countDocuments({
      doctorId: req.userId,
      status: "unseen",
    });
    return res.json({ success: true, count });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.patch("/:id/seen", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const share = await SharedLink.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.userId },
      { status: "seen", seenAt: new Date() },
      { new: true }
    );
    if (!share) return res.json({ success: false, message: "Share not found" });
    return res.json({ success: true, share });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.patch("/:id/feedback", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const feedback = String(req.body.feedback || "").trim();
    if (!feedback) return res.json({ success: false, message: "Feedback is required" });
    const share = await SharedLink.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.userId },
      { feedback, status: "seen", seenAt: new Date(), patientSeenAt: null },
      { new: true }
    );
    if (!share) return res.json({ success: false, message: "Share not found" });
    return res.json({ success: true, share });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.patch("/patient/mark-feedback-seen", authMiddleware, requirePatient, async (req, res) => {
  try {
    await SharedLink.updateMany(
      {
        patientId: req.userId,
        feedback: { $ne: "" },
      },
      { patientSeenAt: new Date() }
    );
    return res.json({ success: true });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

router.delete("/:id/doctor", authMiddleware, requireDoctor, async (req, res) => {
  try {
    const deleted = await SharedLink.findOneAndDelete({
      _id: req.params.id,
      doctorId: req.userId,
    });
    if (!deleted) return res.json({ success: false, message: "Share not found" });
    return res.json({ success: true, message: "Shared record deleted" });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

export default router;
