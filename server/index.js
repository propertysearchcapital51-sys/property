import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import fs from "node:fs";
import helmet from "helmet";
import path from "node:path";
import { DEFAULT_PROJECT_SLUGS, config, uploadsDir } from "./config.js";
import { db } from "./db.js";
import { createUser, originGuard } from "./auth.js";
import authRoutes from "./routes-auth.js";
import mediaRoutes from "./routes-media.js";
import * as blog from "./routes-blog.js";
import * as content from "./routes-content.js";
import * as enquiries from "./routes-enquiries.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "frame-src": ["https://maps.google.com", "https://www.google.com"],
        "connect-src": ["'self'"],
        "object-src": ["'none'"],
        "frame-ancestors": ["'self'"],
        "upgrade-insecure-requests": config.isProd ? [] : null,
      },
    },
  })
);
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use("/api", originGuard);

/* ---------------- API ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api", blog.publicRouter, content.publicRouter, enquiries.publicRouter);
app.use("/api/admin", blog.adminRouter, content.adminRouter, enquiries.adminRouter, mediaRoutes);
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

/* ---------------- Files ---------------- */
app.use("/uploads", express.static(uploadsDir, { index: false, maxAge: "30d", immutable: true }));

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const absolute = (u) => (/^https?:/i.test(u) ? u : `${config.siteUrl}${u.startsWith("/") ? "" : "/"}${u}`);

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
});

app.get("/sitemap.xml", (_req, res) => {
  const urls = ["/", "/about-us", "/properties", "/blog", "/contact"].map((p) => ({ loc: p }));
  let slugs = [...DEFAULT_PROJECT_SLUGS];
  const row = db.prepare("SELECT value FROM content WHERE key = 'projects'").get();
  if (row) { try { slugs = JSON.parse(row.value).map((p) => p.slug); } catch { /* keep defaults */ } }
  slugs.forEach((s) => urls.push({ loc: `/properties/${s}` }));
  db.prepare("SELECT slug, updated_at FROM posts WHERE status='published' ORDER BY published_at DESC").all()
    .forEach((p) => urls.push({ loc: `/blog/${p.slug}`, lastmod: p.updated_at.slice(0, 10) }));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(config.siteUrl + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
    .join("\n")}\n</urlset>`;
  res.type("application/xml").send(xml);
});

const indexFile = path.join(config.distDir, "index.html");
if (fs.existsSync(indexFile)) {
  app.use(
    express.static(config.distDir, {
      index: false,
      setHeaders(res, file) {
        if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      },
    })
  );

  const template = fs.readFileSync(indexFile, "utf8");

  /* Social apps (WhatsApp, Facebook) don't run JavaScript, so blog links get their
     title / image / description injected here for rich link previews. */
  const withMeta = (m) => {
    const tags = [
      `<link rel="canonical" href="${esc(m.url)}" />`,
      `<meta name="description" content="${esc(m.description)}" />`,
      `<meta property="og:type" content="article" />`,
      `<meta property="og:site_name" content="Property Search Capital" />`,
      `<meta property="og:title" content="${esc(m.title)}" />`,
      `<meta property="og:description" content="${esc(m.description)}" />`,
      `<meta property="og:url" content="${esc(m.url)}" />`,
      m.image ? `<meta property="og:image" content="${esc(m.image)}" />` : "",
      `<meta name="twitter:card" content="${m.image ? "summary_large_image" : "summary"}" />`,
    ].join("\n    ");
    return template
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(m.title)}</title>`)
      .replace(/<meta\s+name="description"[^>]*>/i, "")
      .replace("</head>", `    ${tags}\n  </head>`);
  };

  app.get("/{*splat}", (req, res) => {
    res.set("Cache-Control", "no-cache");
    if (req.path.startsWith("/admin")) {
      res.set({ "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" });
      return res.type("html").send(template);
    }
    const match = req.path.match(/^\/blog\/([a-z0-9-]+)\/?$/);
    if (match) {
      const post = db.prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'").get(match[1]);
      if (post) {
        return res.type("html").send(
          withMeta({
            title: `${post.seo_title || post.title} | Property Search Capital`,
            description: post.seo_description || post.excerpt || post.title,
            image: post.cover_image ? absolute(post.cover_image) : "",
            url: `${config.siteUrl}/blog/${post.slug}`,
          })
        );
      }
    }
    res.type("html").send(template);
  });
} else {
  console.log("[server] No dist/ build found: API only. Run `npm run build` to serve the website from this server.");
}

/* ---------------- Errors ---------------- */
app.use((err, _req, res, next) => {
  if (res.headersSent) return next(err);
  let status = err.status || 500;
  let message = err.message;
  if (err.type === "entity.parse.failed") { status = 400; message = "Invalid request body."; }
  if (err.name === "MulterError") { status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400; message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 8 MB)." : "Upload failed."; }
  if (status >= 500) { console.error(err); message = "Something went wrong on our side. Please try again."; }
  res.status(status).json({ error: message });
});

/* ---------------- First-run admin seeding (for hosts without a shell) ---------------- */
if (db.prepare("SELECT COUNT(*) c FROM users").get().c === 0) {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    try {
      createUser({ email: ADMIN_EMAIL, name: ADMIN_NAME || "Administrator", password: ADMIN_PASSWORD, role: "admin" });
      console.log(`[server] Created first admin account: ${ADMIN_EMAIL}. Remove ADMIN_PASSWORD from your environment now.`);
    } catch (e) {
      console.error(`[server] Could not seed admin: ${e.message}`);
    }
  } else {
    console.log("[server] No admin account yet. Run:  npm run create-admin");
  }
}

app.listen(config.port, () => {
  console.log(`[server] Property Search Capital running on ${config.siteUrl} (port ${config.port})`);
});
