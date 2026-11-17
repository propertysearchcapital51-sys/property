import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

const FILE_LINK = /\.[a-z0-9]{2,5}$/i;

/* Luxury curtain between routes: a deep-green panel rises, the brand logo is revealed
   inside a gold ring with a fine progress line, then the panel lifts away to the new page. */
export default function PageTransition() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const panel = useRef(null);
  const covering = useRef(false);
  const first = useRef(true);
  const reduce = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reduce.current) return;

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (FILE_LINK.test(url.pathname)) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      if (covering.current) return;
      covering.current = true;

      const q = gsap.utils.selector(panel.current);

      gsap.killTweensOf(panel.current);
      gsap.set(panel.current, { yPercent: 100, display: "block" });
      gsap.set(q(".pt-logo-stage"), { opacity: 0, scale: 0.8, y: 18 });
      gsap.set(q(".pt-name, .pt-sub, .pt-tag"), { opacity: 0, y: 16 });
      gsap.set(q(".pt-line-fill"), { scaleX: 0 });
      gsap.set(q(".pt-frame"), { opacity: 0 });

      gsap
        .timeline({ onComplete: () => navigate(url.pathname + url.search + url.hash) })
        .to(panel.current, { yPercent: 0, duration: 0.8, ease: "power4.inOut" })
        .to(q(".pt-frame"), { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.35)
        .to(q(".pt-logo-stage"), { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }, 0.4)
        .to(q(".pt-name, .pt-sub, .pt-tag"), { opacity: 1, y: 0, duration: 0.6, stagger: 0.09, ease: "power3.out" }, 0.6)
        .to(q(".pt-line-fill"), { scaleX: 1, duration: 0.75, ease: "power2.inOut" }, 0.55);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);

    if (!covering.current) return; // back/forward navigation: no curtain, just reset scroll

    const q = gsap.utils.selector(panel.current);

    gsap
      .timeline({
        onComplete: () => {
          gsap.set(panel.current, { display: "none" });
          covering.current = false;
          ScrollTrigger.refresh();
        },
      })
      .to(q(".pt-logo-stage, .pt-name, .pt-sub, .pt-tag, .pt-line, .pt-frame"), {
        opacity: 0,
        y: -14,
        duration: 0.4,
        ease: "power2.in",
      }, 0.1)
      .to(panel.current, { yPercent: -100, duration: 0.95, ease: "power4.inOut" }, 0.4);
  }, [pathname]);

  return (
    <div className="page-transition" ref={panel} aria-hidden="true">
      <div className="pt-glow" />
      <div className="pt-frame">
        <span className="pt-corner pt-corner-tl" />
        <span className="pt-corner pt-corner-tr" />
        <span className="pt-corner pt-corner-bl" />
        <span className="pt-corner pt-corner-br" />
      </div>

      <div className="pt-center">
        <div className="pt-logo-stage">
          <span className="pt-ring pt-ring-static" />
          <span className="pt-ring pt-ring-spin" />
          <img src="/logo.webp" alt="" className="pt-logo" />
        </div>

        <div className="pt-name">PROPERTY SEARCH</div>
        <div className="pt-sub"><span />CAPITAL<span /></div>
        <div className="pt-tag">LAND · LIFESTYLE · LEGACY</div>

        <div className="pt-line"><span className="pt-line-fill" /></div>
      </div>
    </div>
  );
}