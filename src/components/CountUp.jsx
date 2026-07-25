import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/* Splits a display value like "$5M", "2,400+", "4.9" or "18" into a
   prefix, the number to animate, a suffix, and its formatting. */
function parse(raw) {
  const match = String(raw).match(/^(\D*)([\d.,]+)(.*)$/);
  if (!match) return { prefix: "", suffix: "", target: 0, decimals: 0, comma: false };
  const [, prefix, numStr, suffix] = match;
  const clean = numStr.replace(/,/g, "");
  const dot = clean.indexOf(".");
  return {
    prefix,
    suffix,
    target: parseFloat(clean) || 0,
    decimals: dot === -1 ? 0 : clean.length - dot - 1,
    comma: numStr.includes(","),
  };
}

function format(n, decimals, comma) {
  if (comma) {
    return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  return n.toFixed(decimals);
}

/** Counts from 0 up to `value` when it first scrolls into view. */
export default function CountUp({ value, duration = 1500 }) {
  const { prefix, suffix, target, decimals, comma } = parse(value);
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduced) {
      setN(target);
      return undefined;
    }

    const node = ref.current;
    let raf;
    let started = false;

    const animate = () => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
        setN(target * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
        else setN(target);
      };
      raf = requestAnimationFrame(tick);
    };

    const begin = () => {
      if (started) return;
      started = true;
      animate();
    };

    if (!node || typeof IntersectionObserver === "undefined") {
      begin();
      return () => cancelAnimationFrame(raf);
    }

    // start only when the number actually scrolls into view — no early
    // failsafe, or it would run (and finish) while still below the fold
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          begin();
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [reduced, target, decimals, comma, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {format(n, decimals, comma)}
      {suffix}
    </span>
  );
}
