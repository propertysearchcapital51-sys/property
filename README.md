# Property Search Capital

React (Vite) website with a **blog**, a secure **admin panel** and a small **Node/Express + SQLite API**.

## Quick start (local)

```bash
npm install
cp .env.example .env            # then fill in JWT_SECRET (see the file for a one-line generator)
npm run create-admin            # creates your admin login (password is typed hidden)
npm run dev                     # website on http://localhost:5173, API on :4000
```
Admin panel: **http://localhost:5173/admin**

## Project structure (flat folders)
```text
server/             Node API (Express). Flat files:
  index.js            app entry: security headers, static files, sitemap, link-preview meta
  config.js db.js     settings + SQLite schema
  auth.js             password hashing, sessions, rate limits
  routes-*.js         auth, blog, site content, media uploads, enquiries
  create-admin.js     CLI to create admin / editor accounts
  sanitize.js validate.js
storage/            (auto-created, git-ignored) psc.db database + uploads/  <-- BACK THIS UP
src/
  assets/ components/ context/ data/ layouts/ pages/ services/ styles/
```
`src/data/*.js` still holds the **original content**. Anything saved in the admin panel is layered on top,
and "Restore original" in the admin removes the override. If the API is ever offline, the site keeps working
from the built-in content.

## What the admin can do (`/admin`)
| Section | Who | What |
| --- | --- | --- |
| Blog posts | admin, editor | Write / edit / publish / unpublish / delete articles in a rich editor, cover image, category, tags, SEO title + description |
| Site content | admin | Company & contact details, brochure PDF, social links, home hero text, FAQs, testimonials, amenities, company values, location ticker |
| Projects | admin | Add / edit / reorder / remove projects, upload photos, highlights |
| Enquiries | admin | Every website form submission (also still sent to WhatsApp); status, call / WhatsApp buttons, CSV export |
| My account | everyone | Change password |

Not editable from the admin (they live in code): the Telugu translations, About-page paragraphs and other
page copy. Ask a developer, or extend `server/routes-content.js` + `src/pages/AdminContent.jsx`.

### Accounts
```bash
npm run create-admin                                   # full administrator
npm run create-admin -- --email a@b.com --name "Asha" --role editor   # editor: blog posts only
```
No terminal on your host? Set `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` once; the account is created on the
first start when no users exist (remove `ADMIN_PASSWORD` afterwards).

## Production
```bash
npm run build
npm start        # serves the website AND the API from one Node process (NODE_ENV=production)
```
* Needs a host that runs **Node 18+** (Hostinger Node.js hosting, Render, Railway, a VPS ...). Static-only hosts
  (plain Vercel / Netlify static, shared PHP hosting) cannot run the API.
* Set the environment variables from `.env.example`. **`JWT_SECRET` is required** in production.
* Put `storage/` on a **persistent disk** and back it up. It holds the database and all uploaded images.
* Serve over **HTTPS** (session cookies are `Secure` in production).
* **Restart the server after every `npm run build`** (it caches `index.html`).
* `https://your-domain/sitemap.xml` and `/robots.txt` are generated automatically. `/admin` and `/api` are not indexed.

## Security notes
Passwords are hashed with scrypt; sessions are httpOnly, SameSite=Strict cookies; login is rate limited;
blog HTML is sanitised on the server; uploads are decoded and re-encoded (images) or magic-byte checked (PDF);
links in site content are restricted to http(s) / mailto / tel; cross-site write requests are rejected;
CSP and other headers are set with Helmet.

## Motion / effects
See `src/styles/effects.css` and the components `Preloader`, `SmoothScroll`, `PageTransition`, `ScrollEffects`,
`CustomCursor`. The admin area deliberately does not load any of them.
