import { Router } from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
import { r2Service } from "@quizio/socket/services/r2Service";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.get("/", async (_req, res) => {
  try {
    const files = await r2Service.listFiles("backgrounds/");
    res.json(files);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to list backgrounds" });
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const ext = path.extname(req.file.originalname);
    const key = `backgrounds/${uuid()}${ext}`;
    const url = await r2Service.uploadFile(
      req.file.buffer,
      key,
      req.file.mimetype,
    );
    res.json({ url, key });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { key } = req.body as { key?: string };
    if (!key || !key.startsWith("backgrounds/")) {
      res.status(400).json({ error: "Invalid key" });
      return;
    }
    await r2Service.deleteFile(key);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Delete failed" });
  }
});

export default router;
