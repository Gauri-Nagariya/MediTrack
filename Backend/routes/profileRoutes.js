import express from "express";
import Profile from "../models/Profile.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { userId, ...formData } = req.body;

    const existing = await Profile.findOne({ userId });

    if (existing) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = new Profile({ userId, ...formData });
    
    await profile.save();

    res.json({ message: "Profile created successfully" });
  } 
  catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/check/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    res.json({ exists: !!profile });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/:userId", async (req, res) => {
  try {
    // console.log("USER ID RECEIVED:", req.params.userId); // 👈 add this

    const profile = await Profile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

// router.put("/update/:userId", async (req, res) => {
//   try {
//     const updated = await Profile.findOneAndUpdate(
//       { userId: req.params.userId },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ message: "Profile not found" });
//     }

//     res.json(updated);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });


router.put("/update/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Clean undefined fields
  	const cleanData = {};
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        cleanData[key] = req.body[key];
      }
    });

    const updated = await Profile.findOneAndUpdate(
      { userId },
      { $set: cleanData },
      { new: true, upsert: true }
    );

    return res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
