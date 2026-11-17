import { Router } from "express";
import { db } from "./db.js";
import { authRequired, enquiryLimiter, requireRole } from "./auth.js";
import { HttpError, text } from "./validate.js";

export const publicRouter = Router();
export const adminRouter = Router();

publicRouter.post("/enquiries", enquiryLimiter, (req, res) => {
  const body = req.body || {};
  if (body.website) return res.json({ ok: true }); // honeypot field: bots fill it, people don't
  const name = text(body.name, 100);
  const phone = text(body.phone, 20).replace(/[^\d+]/g, "");
  if (name.length < 2) throw new HttpError(400, "Please enter your name.");
  if (phone.length < 8) throw new HttpError(400, "Please enter a valid phone number.");
  db.prepare("INSERT INTO enquiries (name, phone, property, message, source) VALUES (?,?,?,?,?)").run(
    name, phone, text(body.property, 100), text(body.message, 1000), text(body.source, 40) || "website"
  );
  res.status(201).json({ ok: true });
});

adminRouter.use(authRequired);
const adminOnly = requireRole("admin");

adminRouter.get("/enquiries", adminOnly, (_req, res) => {
  res.json({ enquiries: db.prepare("SELECT * FROM enquiries ORDER BY id DESC LIMIT 500").all() });
});

adminRouter.patch("/enquiries/:id", adminOnly, (req, res) => {
  const status = ["new", "contacted", "closed"].includes(req.body?.status) ? req.body.status : null;
  if (!status) throw new HttpError(400, "Invalid status.");
  const info = db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, req.params.id);
  if (!info.changes) throw new HttpError(404, "Enquiry not found.");
  res.json({ ok: true });
});

adminRouter.delete("/enquiries/:id", adminOnly, (req, res) => {
  db.prepare("DELETE FROM enquiries WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

adminRouter.get("/stats", (req, res) => {
  const one = (sql) => db.prepare(sql).get().c;
  const stats = {
    published: one("SELECT COUNT(*) c FROM posts WHERE status='published'"),
    drafts: one("SELECT COUNT(*) c FROM posts WHERE status='draft'"),
  };
  if (req.user.role === "admin") {
    stats.newEnquiries = one("SELECT COUNT(*) c FROM enquiries WHERE status='new'");
    stats.totalEnquiries = one("SELECT COUNT(*) c FROM enquiries");
    stats.recent = db.prepare("SELECT * FROM enquiries ORDER BY id DESC LIMIT 5").all();
  }
  res.json(stats);
});
