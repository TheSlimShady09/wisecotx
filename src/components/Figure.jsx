import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/* Counts to a new value instead of snapping, so the estimate reads
   as a live readout rather than a page swap. */
export default function Figure({ value, format = (n) => Math.round(n).toLocaleString("en-US"), duration = 520 }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setShown(value);
      from.current = value;
      return;
    }

    const start = performance.now();
    const origin = from.current;
    let raf;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4); // ease-out-quart
      setShown(origin + (value - origin) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return <span className="mono-num">{format(shown)}</span>;
}
