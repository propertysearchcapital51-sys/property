import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EXCLUDE = ".swiper, .hero-section, .page-hero, .detail-hero, .project-card";
const EASE = "power4.out";

const FADE_UP_GROUPS = [
  ".trust-grid > span",
  ".amenity-item",
  ".stat",
  ".mission-card",
  ".contact-detail",
  ".faq-item",
  ".location-pills a",
  ".review-card",
  ".detail-highlights > div",
  ".detail-amenities > span",
  ".footer-column",
  ".final-cta-actions > *",
  ".document-note",
  ".search-box",
];

const TEXT_BLOCKS = [
  "main .eyebrow",
  ".section-heading > p",
  ".overview-copy > p",
  ".lifestyle-grid p",
  ".faq-grid > div:first-child > p",
  ".location-band p",
  ".final-cta p",
  ".contact-info > p",
  ".about-promise p",
  ".mission-grid p",
].join(",");

const afterLoad = (fn) => {
  if (document.documentElement.classList.contains("is-loading")) {
    window.addEventListener("psc:loaded", fn, { once: true });
  } else {
    fn();
  }
};

/* All GSAP / ScrollTrigger page effects. Rebuilt on every route change. */
export default function ScrollEffects() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups = [];

    const ctx = gsap.context(() => {
      const allowed = (el) => !el.closest(EXCLUDE);

      /* 1 · Headings: masked rise */
      gsap.utils.toArray("main h2").filter(allowed).forEach((el) => {
        const tween = gsap.fromTo(
          el,
          { clipPath: "inset(0 0 100% 0)", yPercent: 40, opacity: 0 },
          {
            clipPath: "inset(0 0 -20% 0)",
            yPercent: 0,
            opacity: 1,
            duration: 1.15,
            ease: EASE,
            paused: true,
            onComplete: () => gsap.set(el, { clearProps: "clipPath,transform,opacity" }),
          }
        );
        ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          once: true,
          onEnter: () => afterLoad(() => tween.play()),
        });
      });

      /* 2 · Eyebrows + intro paragraphs: soft fade up */
      const texts = gsap.utils.toArray(TEXT_BLOCKS).filter(allowed);
      if (texts.length) {
        gsap.set(texts, { opacity: 0, y: 26 });
        ScrollTrigger.batch(texts, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            afterLoad(() =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: EASE,
                stagger: 0.08,
                clearProps: "transform,opacity",
              })
            ),
        });
      }

      /* 3 · Cards, list rows and stats: staggered rise */
      FADE_UP_GROUPS.forEach((selector) => {
        const items = gsap.utils.toArray(selector).filter(allowed);
        if (!items.length) return;
        gsap.set(items, { opacity: 0, y: 44 });
        ScrollTrigger.batch(items, {
          start: "top 93%",
          once: true,
          onEnter: (batch) =>
            afterLoad(() =>
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.95,
                ease: EASE,
                stagger: 0.1,
                clearProps: "transform,opacity",
              })
            ),
        });
      });

      /* 4 · Image frames: curtain reveal */
      gsap.utils.toArray(".parallax-frame").forEach((el) => {
        const tween = gsap.fromTo(
          el,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.4,
            ease: "power4.inOut",
            paused: true,
            onComplete: () => gsap.set(el, { clearProps: "clipPath" }),
          }
        );
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => afterLoad(() => tween.play()),
        });
      });

      /* 5 · Hero / banner parallax */
      const heroTargets = [
        [".hero-background", ".hero-section"],
        [".page-hero-image", ".page-hero"],
        [".detail-hero > img", ".detail-hero"],
      ];
      heroTargets.forEach(([target, trigger]) => {
        const el = document.querySelector(target);
        if (!el) return;
        gsap.fromTo(
          el,
          { yPercent: 0, scale: 1.15 },
          {
            yPercent: 7,
            scale: 1.15,
            ease: "none",
            scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true },
          }
        );
      });

      /* 6 · Magnetic buttons (desktop only) */
      if (fine) {
        gsap.utils.toArray(".button, .social-links a").forEach((el) => {
          const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
          const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
          const move = (e) => {
            const r = el.getBoundingClientRect();
            x((e.clientX - (r.left + r.width / 2)) * 0.28);
            y((e.clientY - (r.top + r.height / 2)) * 0.35);
          };
          const leave = () => {
            x(0);
            y(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });
      }
    });

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      clearTimeout(refresh);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
