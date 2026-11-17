import { Router } from "express";
import { db } from "./db.js";
import { authRequired } from "./auth.js";
import { cleanHtml, plainText, readMinutes } from "./sanitize.js";
import { HttpError, safeUrl, slugify, text } from "./validate.js";

export const publicRouter = Router();
export const adminRouter = Router();

const parseTags = (value) => {
  try { return JSON.parse(value); } catch { return []; }
};

const card = (row) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  coverImage: row.cover_image,
  category: row.category,
  tags: parseTags(row.tags),
  author: row.author,
  readMinutes: row.read_minutes,
  publishedAt: row.published_at,
});

const full = (row) => ({
  ...card(row),
  contentHtml: row.content_html,
  status: row.status,
  seoTitle: row.seo_title,
  seoDescription: row.seo_description,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/* ---------------- Public ---------------- */
publicRouter.get("/posts", (req, res) => {
  const category = text(req.query.category, 60);
  const q = text(req.query.q, 80).toLowerCase();
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 50);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

  const where = ["status = 'published'", "published_at <= datetime('now')"];
  const params = [];
  if (category) { where.push("category = ?"); params.push(category); }
  if (q) {
    where.push("(lower(title) LIKE ? OR lower(excerpt) LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  const clause = where.join(" AND ");
  const rows = db
    .prepare(`SELECT * FROM posts WHERE ${clause} ORDER BY published_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  const total = db.prepare(`SELECT COUNT(*) c FROM posts WHERE ${clause}`).get(...params).c;
  const categories = db
    .prepare("SELECT category, COUNT(*) c FROM posts WHERE status='published' GROUP BY category ORDER BY c DESC")
    .all()
    .map((r) => r.category);
  res.json({ posts: rows.map(card), total, categories });
});

publicRouter.get("/posts/:slug", (req, res) => {
  const row = db
    .prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'")
    .get(req.params.slug);
  if (!row) throw new HttpError(404, "Article not found.");
  const related = db
    .prepare(
      `SELECT * FROM posts WHERE status='published' AND id != ?
       ORDER BY (category = ?) DESC, published_at DESC LIMIT 3`
    )
    .all(row.id, row.category);
  res.json({ post: full(row), related: related.map(card) });
});

/* ---------------- Admin ---------------- */
adminRouter.use(authRequired);

adminRouter.get("/posts", (_req, res) => {
  const rows = db.prepare("SELECT * FROM posts ORDER BY updated_at DESC").all();
  res.json({ posts: rows.map((r) => ({ ...card(r), status: r.status, updatedAt: r.updated_at })) });
});

adminRouter.get("/posts/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  if (!row) throw new HttpError(404, "Post not found.");
  res.json({ post: full(row) });
});

function readBody(body, existing) {
  const title = text(body.title, 160);
  if (title.length < 3) throw new HttpError(400, "Please add a title (at least 3 characters).");
  const status = body.status === "published" ? "published" : "draft";
  const contentHtml = cleanHtml(body.contentHtml);
  if (status === "published" && plainText(contentHtml).length < 30) throw new HttpError(400, "Add some content before publishing.");

  const tags = Array.isArray(body.tags)
    ? [...new Set(body.tags.map((t) => text(t, 30)).filter(Boolean))].slice(0, 8)
    : [];

  let slug = slugify(body.slug || title) || "post";
  const taken = (s) => db.prepare("SELECT id FROM posts WHERE slug = ? AND id != ?").get(s, existing?.id ?? 0);
  if (taken(slug)) {
    let i = 2;
    while (taken(`${slug}-${i}`)) i += 1;
    slug = `${slug}-${i}`;
  }

  let publishedAt = existing?.published_at || null;
  if (status === "published" && !publishedAt) publishedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  if (status === "draft") publishedAt = existing?.published_at || null;

  return {
    slug, title, status, publishedAt, tags: JSON.stringify(tags), contentHtml,
    excerpt: text(body.excerpt, 320),
    coverImage: safeUrl(body.coverImage),
    category: text(body.category, 60) || "General",
    author: text(body.author, 80) || "Property Search Capital",
    seoTitle: text(body.seoTitle, 70),
    seoDescription: text(body.seoDescription, 170),
    readMinutes: readMinutes(contentHtml),
  };
}

adminRouter.post("/posts", (req, res) => {
  const p = readBody(req.body || {}, null);
  const info = db
    .prepare(
      `INSERT INTO posts (slug,title,excerpt,content_html,cover_image,category,tags,author,status,
        seo_title,seo_description,read_minutes,published_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .run(p.slug, p.title, p.excerpt, p.contentHtml, p.coverImage, p.category, p.tags, p.author,
      p.status, p.seoTitle, p.seoDescription, p.readMinutes, p.publishedAt);
  res.status(201).json({ post: full(db.prepare("SELECT * FROM posts WHERE id = ?").get(info.lastInsertRowid)) });
});

adminRouter.put("/posts/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  if (!existing) throw new HttpError(404, "Post not found.");
  const p = readBody(req.body || {}, existing);
  db.prepare(
    `UPDATE posts SET slug=?,title=?,excerpt=?,content_html=?,cover_image=?,category=?,tags=?,author=?,
      status=?,seo_title=?,seo_description=?,read_minutes=?,published_at=?,updated_at=datetime('now') WHERE id=?`
  ).run(p.slug, p.title, p.excerpt, p.contentHtml, p.coverImage, p.category, p.tags, p.author,
    p.status, p.seoTitle, p.seoDescription, p.readMinutes, p.publishedAt, existing.id);
  res.json({ post: full(db.prepare("SELECT * FROM posts WHERE id = ?").get(existing.id)) });
});

adminRouter.delete("/posts/:id", (req, res) => {
  const info = db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
  if (!info.changes) throw new HttpError(404, "Post not found.");
  res.json({ ok: true });
});
