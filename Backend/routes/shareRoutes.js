import express from "express";
import SharedLink from "../models/SharedLink.js";
import Document from "../models/Document.js";

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

export default router;
