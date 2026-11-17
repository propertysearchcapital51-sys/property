import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { db } from "./db.js";
import { HttpError } from "./validate.js";

const COOKIE = "psc_admin";
const SCRYPT = { N: 16384, r: 8, p: 1 };

/* ---------- Password hashing (scrypt, per-user salt) ---------- */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password, stored) {
  try {
    const [scheme, N, r, p, saltHex, hashHex] = String(stored).split("$");
    if (scheme !== "scrypt") return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, {
      N: Number(N), r: Number(r), p: Number(p),
    });
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* Used so login timing does not reveal whether an email exists. */
export const DUMMY_HASH = hashPassword(crypto.randomBytes(8).toString("hex"));

export function passwordProblem(password) {
  if (typeof password !== "string" || password.length < 10) return "Password must be at least 10 characters.";
  if (password.length > 128) return "Password is too long.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) return "Password must include letters and numbers.";
  return null;
}

/* ---------- Session cookie ---------- */
const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "strict",
  secure: config.isProd,
  path: "/",
  maxAge: config.sessionHours * 3600 * 1000,
});

export function startSession(res, user) {
  const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: `${config.sessionHours}h`,
  });
  res.cookie(COOKIE, token, cookieOptions());
}

export function endSession(res) {
  res.clearCookie(COOKIE, { ...cookieOptions(), maxAge: undefined });
}

export const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

/* ---------- Middleware ---------- */
export function authRequired(req, _res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return next(new HttpError(401, "Please sign in."));
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(payload.sub);
    if (!user) return next(new HttpError(401, "Account no longer exists."));
    req.user = user; // role is always read fresh from the database
    next();
  } catch {
    next(new HttpError(401, "Session expired. Please sign in again."));
  }
}

export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(new HttpError(403, "You don't have permission to do that."));

/* Blocks cross-site state-changing requests (defence in depth on top of SameSite=Strict). */
export function originGuard(req, _res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (!origin) return next();
  try {
    const o = new URL(origin);
    const allowed = new Set([req.get("host"), new URL(config.siteUrl).host]);
    if (!config.isProd) allowed.add("localhost:5173").add("127.0.0.1:5173");
    if (allowed.has(o.host)) return next();
  } catch { /* fall through */ }
  next(new HttpError(403, "Cross-site request blocked."));
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please wait 15 minutes and try again." },
});

export const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many enquiries from this connection. Please try again later." },
});

/* ---------- Account creation (used by the CLI and first-run seeding) ---------- */
export function createUser({ email, name, password, role = "admin" }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) throw new Error("Enter a valid email address.");
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  if (!["admin", "editor"].includes(role)) throw new Error("Role must be admin or editor.");
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(cleanEmail)) throw new Error("That email already has an account.");
  const info = db
    .prepare("INSERT INTO users (email, name, password_hash, role) VALUES (?,?,?,?)")
    .run(cleanEmail, String(name || "Administrator").trim().slice(0, 80), hashPassword(password), role);
  return info.lastInsertRowid;
}
