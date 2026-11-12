import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Number that counts up from 0 when it scrolls into view (after the preloader has finished). */
export default function Counter({ to, duration = 2 }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const state = { value: 0 };
    el.textContent = "0";

    const tween = gsap.to(state, {
      value: to,
      duration,
      ease: "power2.out",
      paused: true,
      onUpdate: () => {
        el.textContent = String(Math.round(state.value));
      },
    });

    const play = () => {
      if (document.documentElement.classList.contains("is-loading")) {
        window.addEventListener("psc:loaded", () => tween.play(), { once: true });
      } else {
        tween.play();
      }
    };

    const trigger = ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: play });

    return () => {
      trigger.kill();
      tween.kill();
      el.textContent = String(to);
    };
  }, [to, duration]);

  return <b className="counter-num" ref={ref}>{to}</b>;
}
