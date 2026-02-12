/**
 * Multer upload configuration for post images.
 * Stores uploaded files locally under /uploads/posts.
 */
import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/AppError";

const uploadsRoot = path.join(process.cwd(), "uploads", "posts");
fs.mkdirSync(uploadsRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${safeExt}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Only image files are allowed", 400));
  }
  return cb(null, true);
};

export const uploadPostImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
