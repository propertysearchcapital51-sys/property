import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, "..");

const isProd = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 4000;

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProd) {
    console.error("[config] JWT_SECRET is required when NODE_ENV=production. Exiting.");
    process.exit(1);
  }
  jwtSecret = crypto.randomBytes(32).toString("hex");
  console.warn("[config] JWT_SECRET not set: using a temporary secret (admin sessions reset on restart).");
}

export const config = {
  isProd,
  port,
  jwtSecret,
  siteUrl: (process.env.SITE_URL || `http://localhost:${port}`).replace(/\/$/, ""),
  storageDir: path.resolve(ROOT, process.env.STORAGE_DIR || "storage"),
  distDir: path.join(ROOT, "dist"),
  sessionHours: 8,
};

export const uploadsDir = path.join(config.storageDir, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

/* Project slugs that ship with the site (used for the sitemap before any admin edits). */
export const DEFAULT_PROJECT_SLUGS = [
  "ghatkesar", "rangareddy-guda", "kandi", "kothur", "dundigal", "sadashivpet",
];
