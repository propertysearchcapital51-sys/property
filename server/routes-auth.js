import { Router } from "express";
import { db } from "./db.js";
import {
  DUMMY_HASH, authRequired, endSession, hashPassword, loginLimiter,
  passwordProblem, publicUser, startSession, verifyPassword,
} from "./auth.js";
import { HttpError, text } from "./validate.js";

const router = Router();

router.post("/login", loginLimiter, (req, res) => {
  const email = text(req.body?.email, 200).toLowerCase();
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const user = email ? db.prepare("SELECT * FROM users WHERE email = ?").get(email) : null;
  const ok = verifyPassword(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) throw new HttpError(401, "Incorrect email or password.");
  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);
  startSession(res, user);
  res.json({ user: publicUser(user) });
});

router.post("/logout", (_req, res) => {
  endSession(res);
  res.json({ ok: true });
});

router.get("/me", authRequired, (req, res) => res.json({ user: publicUser(req.user) }));

router.post("/change-password", authRequired, (req, res) => {
  const { current, next } = req.body || {};
  if (!verifyPassword(String(current || ""), req.user.password_hash)) {
    throw new HttpError(400, "Your current password is incorrect.");
  }
  const problem = passwordProblem(next);
  if (problem) throw new HttpError(400, problem);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(next), req.user.id);
  res.json({ ok: true });
});

export default router;
