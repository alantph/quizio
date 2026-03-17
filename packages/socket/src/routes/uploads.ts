import { Router } from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import { r2Service } from "@quizio/socket/services/r2Service";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("audio/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image, video, and audio files are allowed"));
    }
  },
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const ext = path.extname(req.file.originalname);
    const key = `${uuid()}${ext}`;
    const url = await r2Service.uploadFile(
      req.file.buffer,
      key,
      req.file.mimetype,
    );
    res.json({ url });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

export default router;
