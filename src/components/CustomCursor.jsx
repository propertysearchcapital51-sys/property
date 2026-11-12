import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const INTERACTIVE = "a, button, [role='button'], label, select, summary, .swiper-pagination-bullet";
const TEXT_FIELD = "input, textarea";

/* Dot + trailing ring cursor. Desktop / fine pointers only; grows on links, shows "VIEW" on project images. */
export default function CustomCursor() {
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const html = document.documentElement;
    html.classList.add("has-cursor");

    const dotEl = dot.current;
    const ringEl = ring.current;
    gsap.set([dotEl, ringEl], { xPercent: -50, yPercent: -50 });

    const dotX = gsap.quickTo(dotEl, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dotEl, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(ringEl, "x", { duration: 0.55, ease: "power3" });
    const ringY = gsap.quickTo(ringEl, "y", { duration: 0.55, ease: "power3" });

    let visible = false;
    const show = (on) => {
      if (visible === on) return;
      visible = on;
      gsap.to([dotEl, ringEl], { opacity: on ? 1 : 0, duration: 0.3 });
    };

    const onMove = (e) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      show(true);
    };

    const onOver = (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      let state = "";
      if (target.tagName === "IFRAME") state = "text";
      else if (target.closest(".project-image")) state = "view";
      else if (target.closest(TEXT_FIELD)) state = "text";
      else if (target.closest(INTERACTIVE)) state = "link";
      ringEl.dataset.state = state;
      dotEl.dataset.state = state;
    };

    const onDown = () => ringEl.classList.add("is-down");
    const onUp = () => ringEl.classList.remove("is-down");
    const onLeave = () => show(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true"><span>VIEW</span></div>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  );
}
