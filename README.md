# Property Search Capital

Premium, responsive React + Vite website starter for Property Search Capital. Includes Home, About, Properties, dynamic project detail pages and Contact pages, English/Telugu UI toggle, Swiper carousels, GSAP + Lenis + Framer Motion effects, and WhatsApp enquiry actions.

## Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```

## Project structure (flat: one level per folder)
```text
src/
  assets/        All images (.svg placeholders) directly inside, no sub-folders
  components/    Components only: Header, Footer, ProjectCard, Preloader, SmoothScroll ...
  context/       Language context and English/Telugu strings
  data/          Projects, content and company information
  layouts/       MainLayout (mounts the global effects)
  pages/         Home, About, Properties, PropertyDetails, Contact, NotFound
  styles/        global.css (design system) + effects.css (motion layer)
  App.jsx
  main.jsx
public/documents/   Place your final brochure PDF here
```

## Motion / effects (GSAP + Lenis + Framer Motion)
| Effect | File |
| --- | --- |
| Preloader: 000-100 counter, logo, curved curtain lift | `components/Preloader.jsx` |
| Lenis inertia smooth scroll (synced with GSAP) | `components/SmoothScroll.jsx` |
| Curtain wipe between pages | `components/PageTransition.jsx` |
| Heading masks, staggered card reveals, image curtains, hero parallax, magnetic buttons | `components/ScrollEffects.jsx` |
| Dot + ring cursor ("VIEW" on project images), desktop only | `components/CustomCursor.jsx` |
| Gold scroll progress line | `components/ScrollProgress.jsx` |
| Count-up numbers / word-by-word headline | `components/Counter.jsx`, `components/SplitText.jsx` |
| Hide-on-scroll header | `components/Header.jsx` |
| All effect styling (hero intro, hovers, cursor, preloader) | `styles/effects.css` |

Effects respect `prefers-reduced-motion`, and the cursor is disabled on touch devices.
To change preloader timing, edit the `duration` values in `Preloader.jsx`.

## Add your images
All displayed project and section images are imported from `src/assets/` in the source code. Replace the sample `.svg` files with your actual image files and update the matching imports in `src/data/projects.js` or `src/data/siteImages.js`. Keep filenames and extensions in sync. Recommended formats: WebP or optimized JPG; aim for 1600px wide hero images and 900px wide project images.

Current SVG artwork is only a local visual placeholder so the app runs immediately; it is not a photograph of an actual venture.

## Brochure
Copy the approved PDF into `public/documents/PSC-Consolidated-Brochure.pdf`. The header/footer brochure links already point there. Until you add the file, the link will not have a document to open.

## Enquiry form
The demo form creates a WhatsApp message addressed to +91 9948002024. For production lead capture, connect a secure backend/API or CRM and add server-side validation, consent handling and spam protection. Do not put private API keys in frontend code.

## Content verification
Verify project approval numbers, legal status, inventory, statistics, amenities, pricing, location claims and testimonials before publishing. Do not advertise HMDA/DTCP/RERA approval or guarantees unless documentation confirms the exact claim for that project. The supplied company copy includes statistics and testimonials; these are marked as editable content and should be verified.

## Deployment
Build with `npm run build` and deploy the `dist/` directory to Hostinger static hosting, Netlify, Vercel or another static host. Configure SPA fallback so routes such as `/properties/ghatkesar` resolve to `index.html`.
