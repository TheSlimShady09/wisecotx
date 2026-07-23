import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import CanvasStage from "./CanvasStage.jsx";
import { COMPANY, MODULES, MODULE_ORDER } from "../lib/site.js";
import { stagePropsForModule } from "../lib/scene.js";
import { rememberEntry } from "../lib/entry.js";

/* The idle house before any choice is made: a plain rotating gable. */
const IDLE_STAGE = {
  pitch: 1,
  hipInset: 0,
  textureKind: "shingles",
  roughness: 0.9,
  metalness: 0,
  tone: 0.48,
  spin: 0.13,
  targetAngle: null,
  hotspots: [],
  markerLabel: null,
  prop: null,
};

const EASE = [0.22, 1, 0.36, 1];

export default function EntryGate({ onChoose }) {
  const [hovered, setHovered] = useState(null);
  const [armed, setArmed] = useState(null);
  // the gate opens on a WCG intro, then reveals the three choices, none
  // pre-selected — you arm one yourself
  const [phase, setPhase] = useState("intro");
  const reduced = useReducedMotion();
  const rootRef = useRef(null);
  const firstRef = useRef(null);

  /* the house follows the armed choice; before anything is armed it
     previews whatever is being hovered or focused */
  const shownId = armed ?? hovered;
  const shownModule = shownId ? MODULES[shownId] : null;
  const armedModule = armed ? MODULES[armed] : null;

  const stage = shownId
    ? (() => {
        const base = stagePropsForModule(shownId);
        // face the choice's own angle when its scene doesn't already
        // orient toward a marked slope
        return { ...base, targetAngle: base.targetAngle ?? MODULES[shownId].viewAngle };
      })()
    : IDLE_STAGE;

  const enter = useCallback(
    (moduleId) => {
      rememberEntry();
      onChoose(moduleId);
    },
    [onChoose],
  );

  /* First interaction with a choice arms it (the house dresses itself
     for that module and a confirm appears). The second interaction with
     the SAME choice enters. This is the "press twice" the brief asks
     for: a preview step before you commit. */
  const pick = useCallback(
    (moduleId) => {
      setArmed((current) => {
        if (current === moduleId) {
          enter(moduleId);
          return current;
        }
        return moduleId;
      });
    },
    [enter],
  );

  /* lock the page behind the gate */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // the intro plays, then hands over to the choices; focus lands on the
  // first choice only once they are on screen
  useEffect(() => {
    if (phase !== "intro") return undefined;
    const id = window.setTimeout(() => setPhase("choose"), reduced ? 500 : 2200);
    return () => window.clearTimeout(id);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase === "choose") firstRef.current?.focus();
  }, [phase]);

  /* keyboard: 1/2/3 arm then enter, Enter confirms, Escape browses,
     Tab stays inside */
  useEffect(() => {
    const onKey = (event) => {
      // any key during the intro just skips it
      if (phase === "intro") {
        event.preventDefault();
        setPhase("choose");
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        enter(null);
        return;
      }
      if (event.key === "Enter" && armed) {
        event.preventDefault();
        enter(armed);
        return;
      }

      const index = ["1", "2", "3"].indexOf(event.key);
      if (index !== -1) {
        event.preventDefault();
        pick(MODULE_ORDER[index]);
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
  }, [phase, armed, enter, pick]);

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
      transition={{ duration: reduced ? 0.15 : 0.45, ease: EASE }}
    >
      <AnimatePresence mode="wait">
        {phase === "intro" ? (
          <motion.button
            key="intro"
            type="button"
            className="gate__intro"
            onClick={() => setPhase("choose")}
            aria-label={`Enter — ${COMPANY.fullName}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: reduced ? 1 : 0.985 }}
            transition={{ duration: reduced ? 0.15 : 0.55, ease: EASE }}
          >
            <motion.span
              className="gate__intro-mark"
              aria-hidden="true"
              initial={{ opacity: 0, y: reduced ? 0 : 14, scale: reduced ? 1 : 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <svg viewBox="0 0 28 22">
                <path d="M2 12 L14 2 L26 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path
                  d="M6 20 L14 8 L22 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  opacity="0.45"
                />
              </svg>
            </motion.span>

            <motion.span
              className="gate__intro-word"
              initial={{ opacity: 0, y: reduced ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.14, duration: 0.75, ease: EASE }}
            >
              WCG
            </motion.span>

            <motion.span
              className="gate__intro-line"
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: reduced ? 0 : 0.5, duration: 0.8, ease: EASE }}
            />

            <motion.span
              className="gate__intro-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.72, duration: 0.6 }}
            >
              {COMPANY.fullName}
            </motion.span>
          </motion.button>
        ) : (
          <motion.div
            key="choose"
            className="gate__inner"
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.5, ease: EASE }}
          >
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
                const isArmed = armed === id;
                const isShown = shownId === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      ref={i === 0 ? firstRef : null}
                      className={`gate__row ${isShown ? "is-active" : ""} ${isArmed ? "is-armed" : ""}`}
                      aria-pressed={isArmed}
                      onMouseEnter={() => setHovered(id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(id)}
                      onBlur={() => setHovered(null)}
                      onClick={() => pick(id)}
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
                        {isArmed ? "↵" : "→"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="gate__foot">
              <button type="button" className="btn btn--ghost gate__skip" onClick={() => enter(null)}>
                Or browse the whole site
              </button>
              <span className="anno--dim gate__hint">Pick to preview · again to enter</span>
            </div>
          </div>

          <div className="gate__right">
            <CanvasStage
              className="gate__stage"
              tagLeft={shownModule ? `${shownModule.code} · ${shownModule.label}` : "Idle · rotating"}
              tagRight={armed ? "Selected" : "WCG-STD-01"}
              fallbackNote="WCG — standard gable, chimney to the east"
              assemble
              {...stage}
            />

            {/* confirm step: the second action lives here, made explicit,
                and mirrors clicking the armed row a second time */}
            <div className="gate__confirm">
              <AnimatePresence mode="wait" initial={false}>
                {armedModule ? (
                  <motion.button
                    key={armed}
                    type="button"
                    className="btn btn--solid gate__enter"
                    onClick={() => enter(armed)}
                    initial={{ opacity: 0, y: reduced ? 0 : 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduced ? 0 : -6 }}
                    transition={{ duration: reduced ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Enter {armedModule.label}
                    <span className="btn-arrow" aria-hidden="true">
                      →
                    </span>
                  </motion.button>
                ) : (
                  <motion.p
                    key="readout"
                    className="gate__readout anno--dim"
                    aria-live="polite"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0.12 : 0.24 }}
                  >
                    {shownModule ? shownModule.hoverLine : "One house, three roles — pick a route to see it change."}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
