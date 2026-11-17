
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const CURVE_BULGE = "M0 0 H100 V0 Q50 18 0 0 Z";
const CURVE_FLAT = "M0 0 H100 V0 Q50 0 0 0 Z";

export default function Preloader() {
  const root = useRef(null);
  const counter = useRef(null);
  const progressFill = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let cancelled = false;
    let exitStarted = false;

    const release = () => {
      html.classList.remove("is-loading");
      html.classList.add("is-loaded");
      window.dispatchEvent(new Event("psc:loaded"));
    };

    if (reduceMotion) {
      release();
      setDone(true);
      return;
    }

    const ready = Promise.race([
      document.fonts?.ready || Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);

    const context = gsap.context(() => {
      const progress = { value: 0 };

      const intro = gsap.timeline();

      // Background atmosphere
      intro.from(".preloader-glow", {
        opacity: 0,
        scale: 0.7,
        duration: 1.5,
        ease: "power3.out",
      });

      // Top and bottom details
      intro.from(
        ".preloader-topline, .preloader-bottomline",
        {
          opacity: 0,
          y: 18,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
        },
        0.2
      );

      // Logo reveal
      intro.from(
        ".preloader-logo-wrap",
        {
          opacity: 0,
          scale: 0.72,
          rotation: -8,
          duration: 1.2,
          ease: "back.out(1.5)",
        },
        0.35
      );

      // Brand typography
      intro.from(
        ".preloader-brand-name, .preloader-brand-subtitle, .preloader-description",
        {
          opacity: 0,
          y: 24,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
        },
        0.8
      );

      // Gold orbit animation
      intro.from(
        ".preloader-orbit",
        {
          opacity: 0,
          scale: 0.75,
          duration: 1.2,
          ease: "power2.out",
        },
        0.35
      );

      // Loading progress
      intro.to(
        progress,
        {
          value: 100,
          duration: 2.6,
          ease: "power2.inOut",
          onUpdate: () => {
            const value = Math.round(progress.value);

            if (counter.current) {
              counter.current.textContent = String(value).padStart(3, "0");
            }

            if (progressFill.current) {
              gsap.set(progressFill.current, {
                scaleX: progress.value / 100,
              });
            }
          },
        },
        0.45
      );

      // Wait for fonts or fallback timeout, then exit
      intro.add(() => {
        ready.then(() => {
          if (cancelled || exitStarted) return;
          exitStarted = true;

          const exit = gsap.timeline({
            onComplete: () => {
              if (!cancelled) {
                release();
                setDone(true);
              }
            },
          });

          exit
            .to(".preloader-content", {
              opacity: 0,
              y: -35,
              scale: 0.98,
              duration: 0.55,
              ease: "power2.in",
            })
            .to(
              ".preloader-glow",
              {
                opacity: 0,
                scale: 1.4,
                duration: 0.7,
                ease: "power2.in",
              },
              "<"
            )
            .to(
              root.current,
              {
                yPercent: -100,
                duration: 1.15,
                ease: "power4.inOut",
              },
              "-=0.05"
            )
            .fromTo(
              ".preloader-curve path",
              { attr: { d: CURVE_BULGE } },
              {
                attr: { d: CURVE_FLAT },
                duration: 1.15,
                ease: "power4.inOut",
              },
              "<"
            );
        });
      });
    }, root);

    return () => {
      cancelled = true;
      context.revert();
    };
  }, []);

  if (done) return null;

  return (
    <div
      className="preloader"
      ref={root}
      role="presentation"
      aria-hidden="true"
    >
      <div className="preloader-grid" />

      <div className="preloader-glow" />

      <div className="preloader-content">

        {/* TOP BRAND DETAILS */}
        <div className="preloader-topline">
          <span className="preloader-location">
            <span className="preloader-status-dot" />
            HYDERABAD, INDIA
          </span>

          <span className="preloader-category">
            LAND · LIFESTYLE · LEGACY
          </span>
        </div>

        {/* CENTER BRAND REVEAL */}
        <div className="preloader-center">

          <div className="preloader-logo-stage">
            <div className="preloader-orbit preloader-orbit-one" />
            <div className="preloader-orbit preloader-orbit-two" />

            <div className="preloader-logo-wrap">
              <img
                src="/logo.webp"
                alt="Property Search Capital"
                className="preloader-logo-image"
              />
            </div>
          </div>

          <div className="preloader-brand-name">
            PROPERTY SEARCH
          </div>

          <div className="preloader-brand-subtitle">
            <span />
            CAPITAL
            <span />
          </div>

          <p className="preloader-description">
            FIND YOUR PERFECT LAND
          </p>

          <div className="preloader-divider" />
        </div>

        {/* BOTTOM LOADING DETAILS */}
        <div className="preloader-bottomline">
          <div className="preloader-loading-copy">
            <span className="preloader-loading-label">
              PREPARING YOUR EXPERIENCE
            </span>

            <span className="preloader-loading-caption">
              DISCOVER. INVEST. GROW.
            </span>
          </div>

          
        </div>

        {/* PROGRESS BAR */}
        <div className="preloader-progress">
          <span
            className="preloader-progress-fill"
            ref={progressFill}
          />
        </div>
      </div>

      <svg
        className="preloader-curve"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={CURVE_BULGE} />
      </svg>
    </div>
  );
}
