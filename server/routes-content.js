import { Router } from "express";
import { db } from "./db.js";
import { authRequired, requireRole } from "./auth.js";
import { HttpError, S, clean, slugify } from "./validate.js";

export const publicRouter = Router();
export const adminRouter = Router();

/* Each editable section of the website and the exact shape we accept for it. */
const schemas = {
  company: S.obj({
    name: S.str(100),
    phone: S.str(30),
    whatsapp: S.str(20),
    email: S.str(120),
    address: S.str(300),
    shortAddress: S.str(200),
    brochure: S.url(),
    mapUrl: S.url(800),
    socials: S.obj({ facebook: S.url(), instagram: S.url(), threads: S.url(), youtube: S.url() }),
  }),
  hero: S.obj({ eyebrow: S.str(80), title: S.str(120), text: S.str(300) }),
  projects: S.arr(
    S.obj({
      id: S.str(80), slug: S.str(80), name: S.str(80), image: S.url(),
      tagline: S.str(120), location: S.str(160),
      description: S.str(400), longDescription: S.str(1500),
      highlights: S.arr(S.str(160), 12),
    }),
    30
  ),
  amenities: S.arr(S.str(200), 40),
  values: S.arr(S.obj({ number: S.str(4), title: S.str(60), text: S.str(300) }), 8),
  testimonials: S.arr(S.obj({ quote: S.str(500), name: S.str(80), role: S.str(80) }), 12),
  faqs: S.arr(S.obj({ q: S.str(240), a: S.str(1200) }), 30),
  openLocations: S.arr(S.str(60), 20),
};

/* ---------- Public: all saved overrides in one request ---------- */
publicRouter.get("/content", (_req, res) => {
  const out = {};
  for (const row of db.prepare("SELECT key, value FROM content").all()) {
    try { out[row.key] = JSON.parse(row.value); } catch { /* ignore corrupt row */ }
  }
  res.set("Cache-Control", "no-cache");
  res.json(out);
});

/* ---------- Admin ---------- */
const guard = [authRequired, requireRole("admin")];

adminRouter.put("/content/:key", guard, (req, res) => {
  const { key } = req.params;
  const spec = schemas[key];
  if (!spec) throw new HttpError(404, "Unknown section.");

  let value = clean(spec, req.body?.value);

  if (key === "projects") {
    const seen = new Set();
    value = value.map((p, i) => {
      let slug = slugify(p.slug || p.name) || `project-${i + 1}`;
      while (seen.has(slug)) slug += "-2";
      seen.add(slug);
      return { ...p, slug, id: slug };
    });
    if (value.some((p) => !p.name)) throw new HttpError(400, "Every project needs a name.");
  }

  db.prepare(
    `INSERT INTO content (key, value, updated_at, updated_by) VALUES (?, ?, datetime('now'), ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`
  ).run(key, JSON.stringify(value), req.user.email);
  res.json({ key, value });
});

adminRouter.delete("/content/:key", guard, (req, res) => {
  if (!schemas[req.params.key]) throw new HttpError(404, "Unknown section.");
  db.prepare("DELETE FROM content WHERE key = ?").run(req.params.key);
  res.json({ ok: true });
});

adminRouter.get("/content-meta", guard, (_req, res) => {
  res.json({
    sections: db.prepare("SELECT key, updated_at, updated_by FROM content").all(),
  });
});
