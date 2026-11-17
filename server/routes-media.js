import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { db } from "./db.js";
import { uploadsDir } from "./config.js";
import { authRequired } from "./auth.js";
import { HttpError, text } from "./validate.js";

const router = Router();
router.use(authRequired);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 1 } });
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) throw new HttpError(400, "Choose a file to upload.");
  const id = crypto.randomBytes(8).toString("hex");
  const original = text(file.originalname, 120) || "upload";

  /* PDF documents (e.g. the brochure) — verified by magic bytes, stored untouched. */
  if (file.mimetype === "application/pdf") {
    if (file.buffer.subarray(0, 5).toString("latin1") !== "%PDF-") throw new HttpError(400, "That doesn't look like a valid PDF.");
    const filename = `${id}.pdf`;
    fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
    db.prepare("INSERT INTO media (filename, original, mime, size) VALUES (?,?,?,?)")
      .run(filename, original, "application/pdf", file.size);
    return res.status(201).json({ url: `/uploads/${filename}`, filename, type: "pdf" });
  }

  if (!IMAGE_TYPES.has(file.mimetype)) throw new HttpError(400, "Upload a JPG, PNG, WebP or GIF image (or a PDF).");

  /* Images are decoded (rejects disguised files), auto-rotated, resized and saved as WebP. */
  let output;
  try {
    output = await sharp(file.buffer, { failOn: "error" })
      .rotate()
      .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new HttpError(400, "That image could not be read. Try another file.");
  }
  const filename = `${id}.webp`;
  fs.writeFileSync(path.join(uploadsDir, filename), output.data);
  db.prepare("INSERT INTO media (filename, original, mime, size, width, height) VALUES (?,?,?,?,?,?)")
    .run(filename, original, "image/webp", output.info.size, output.info.width, output.info.height);
  res.status(201).json({
    url: `/uploads/${filename}`, filename, type: "image",
    width: output.info.width, height: output.info.height,
  });
});

router.get("/media", (_req, res) => {
  const rows = db.prepare("SELECT * FROM media ORDER BY id DESC LIMIT 200").all();
  res.json({ media: rows.map((m) => ({ ...m, url: `/uploads/${m.filename}` })) });
});

router.delete("/media/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM media WHERE id = ?").get(req.params.id);
  if (!row) throw new HttpError(404, "File not found.");
  fs.rmSync(path.join(uploadsDir, path.basename(row.filename)), { force: true });
  db.prepare("DELETE FROM media WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

export default router;
