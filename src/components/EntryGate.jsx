import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import CanvasStage from "./CanvasStage.jsx";
import { COMPANY, MODULES, MODULE_ORDER } from "../lib/site.js";
import { rememberEntry } from "../lib/entry.js";

export default function EntryGate({ onChoose }) {
  const [active, setActive] = useState(null);
  const reduced = useReducedMotion();
  const rootRef = useRef(null);
  const firstRef = useRef(null);

  const focused = active ? MODULES[active] : null;

  /* Choosing does NOT jump straight into the module page — it drops you
     at that module's section on the landing, where its own 3D house is
     waiting. The deeper page is one more click from there.

     Dismissing unmounts immediately so the page mounts underneath while
     the gate fades off the top of it; App owns the AnimatePresence, so
     the exit still plays. */
  const close = useCallback(
    (moduleId) => {
      rememberEntry();
      onChoose(moduleId);
    },
    [onChoose],
  );

  /* lock the page behind the gate */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  /* keyboard: 1/2/3 to choose, Escape to browse, Tab stays inside */
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(null);
        return;
      }

      const index = ["1", "2", "3"].indexOf(event.key);
      if (index !== -1) {
        event.preventDefault();
        close(MODULE_ORDER[index]);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = rootRef.current?.querySelectorAll("button, a[href]");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <motion.div
      ref={rootRef}
      className="gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduced ? 1 : 1.03 }}
      transition={{ duration: reduced ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="gate__inner">
        <header className="gate__head">
          <span className="gate__mark">
            <svg viewBox="0 0 28 22" aria-hidden="true">
              <path d="M2 12 L14 2 L26 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path
                d="M6 20 L14 8 L22 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
                opacity="0.45"
              />
            </svg>
            {COMPANY.name}
          </span>
          <span className="anno--dim gate__licence">{COMPANY.license}</span>
        </header>

        <div className="gate__body">
          <div className="gate__left">
            <h1 id="gate-title" className="gate__title">
              Where do you need help with your roof?
            </h1>

            <ul className="gate__list">
              {MODULE_ORDER.map((id, i) => {
                const module = MODULES[id];
                const isActive = active === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      ref={i === 0 ? firstRef : null}
                      className={`gate__row ${isActive ? "is-active" : ""}`}
                      onMouseEnter={() => setActive(id)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(id)}
                      onBlur={() => setActive(null)}
                      onClick={() => close(id)}
                    >
                      <span className="gate__row-key anno--dim" aria-hidden="true">
                        {i + 1}
                      </span>
                      <span className="gate__row-main">
                        <span className="gate__row-label">{module.label}</span>
                        <span className="gate__row-tagline">{module.tagline}</span>
                        <span className="gate__row-reveal">
                          <span className="gate__row-reveal-inner">{module.hoverLine}</span>
                        </span>
                      </span>
                      <span className="gate__row-arrow" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="gate__foot">
              <button type="button" className="btn btn--ghost gate__skip" onClick={() => close(null)}>
                Or browse the whole site
              </button>
              <span className="anno--dim gate__hint">Press 1, 2 or 3</span>
            </div>
          </div>

          <div className="gate__right">
            <CanvasStage
              className="gate__stage"
              tagLeft={focused ? `Mode · ${focused.label}` : "Idle · rotating"}
              tagRight="WCG-STD-01"
              fallbackNote="Wise Co Group — standard gable, chimney to the east"
              assemble
              targetAngle={focused ? focused.viewAngle : null}
              tone={focused ? focused.roofTone : 0.48}
              textureKind="shingles"
              roughness={0.9}
              metalness={0}
              pitch={1}
              hipInset={0}
              spin={0.13}
            />
            <p className="gate__readout anno--dim" aria-live="polite">
              {focused ? focused.hoverLine : "One house, three roles — pick a route to orient it."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
