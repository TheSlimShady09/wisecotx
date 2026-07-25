import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { SERVICE_CATEGORIES } from "../lib/site.js";

const EASE = [0.22, 1, 0.36, 1];
const INTERVAL = 5200;

export default function ServicesSlideshow() {
  const [[index, dir], setState] = useState([0, 1]);
  const reduced = useReducedMotion();
  const paused = useRef(false);
  const count = SERVICE_CATEGORIES.length;
  const cat = SERVICE_CATEGORIES[index];

  const goTo = useCallback(
    (next) => {
      setState(([current]) => [(next + count) % count, next >= current ? 1 : -1]);
    },
    [count],
  );
  const paginate = useCallback((delta) => setState(([i]) => [(i + delta + count) % count, delta]), [count]);

  // auto-advance, paused while the visitor is interacting
  useEffect(() => {
    if (reduced) return undefined;
    const id = window.setInterval(() => {
      if (!paused.current) setState(([i]) => [(i + 1) % count, 1]);
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, [reduced, count]);

  const hold = () => {
    paused.current = true;
  };
  const release = () => {
    paused.current = false;
  };

  return (
    <div
      className="sslide"
      onMouseEnter={hold}
      onMouseLeave={release}
      onFocusCapture={hold}
      onBlurCapture={release}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") paginate(-1);
        if (e.key === "ArrowRight") paginate(1);
      }}
    >
      {/* tabs — the category names double as the slideshow navigation */}
      <div className="sslide__tabs" role="tablist" aria-label="Services">
        {SERVICE_CATEGORIES.map((c, i) => (
          <button
            key={c.code}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={`sslide__tab ${i === index ? "is-active" : ""}`}
            onClick={() => goTo(i)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="sslide__viewport">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={cat.code}
            className="sslide__slide"
            initial={{ opacity: 0, x: reduced ? 0 : dir * 44 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduced ? 0 : dir * -44 }}
            transition={{ duration: reduced ? 0.2 : 0.5, ease: EASE }}
          >
            <div className="sslide__lead">
              <span className="sslide__num anno--dim">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              <h3 className="sslide__label">{cat.label}</h3>
              <p className="sslide__blurb prose">{cat.blurb}</p>
            </div>
            <ul className="sslide__list">
              {cat.services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="sslide__controls">
        <button type="button" className="sslide__arrow" onClick={() => paginate(-1)} aria-label="Previous service">
          ←
        </button>
        <div className="sslide__dots" aria-hidden="true">
          {SERVICE_CATEGORIES.map((c, i) => (
            <span key={c.code} className={`sslide__dot ${i === index ? "is-active" : ""}`} />
          ))}
        </div>
        <button type="button" className="sslide__arrow" onClick={() => paginate(1)} aria-label="Next service">
          →
        </button>
      </div>
    </div>
  );
}
