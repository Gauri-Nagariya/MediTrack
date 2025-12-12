import multer from "multer";

const storage = multer.memoryStorage(); // store file in memory (RAM)

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (optional)
});

export default upload;
