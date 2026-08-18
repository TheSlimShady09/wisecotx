import { useCallback, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { COMPANY } from "../lib/site.js";
import { rememberEntry } from "../lib/entry.js";

const EASE = [0.22, 1, 0.36, 1];

/* A WCG intro splash that plays on first arrival, then hands straight to
   the home page — no choose-a-route step. Click or any key skips it. */
export default function EntryGate({ onDone }) {
  const reduced = useReducedMotion();

  const dismiss = useCallback(() => {
    rememberEntry();
    onDone();
  }, [onDone]);

  // auto-advance once the intro has played
  useEffect(() => {
    const id = window.setTimeout(dismiss, reduced ? 600 : 2600);
    return () => window.clearTimeout(id);
  }, [dismiss, reduced]);

  // any key skips
  useEffect(() => {
    const onKey = (event) => {
      event.preventDefault();
      dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss]);

  // lock scroll behind the splash
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <motion.div
      className="gate"
      role="button"
      tabIndex={0}
      aria-label={`Enter — ${COMPANY.fullName}`}
      onClick={dismiss}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduced ? 1 : 1.03 }}
      transition={{ duration: reduced ? 0.15 : 0.5, ease: EASE }}
    >
      <div className="gate__intro">
        <motion.img
          className="gate__intro-logo"
          src="/wcg-logo.png"
          alt={COMPANY.name}
          initial={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        />
        <motion.span
          className="gate__intro-line"
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: reduced ? 0 : 0.45, duration: 0.8, ease: EASE }}
        />
        <motion.span
          className="gate__intro-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.6, duration: 0.6 }}
        >
          {COMPANY.tagline}
        </motion.span>
      </div>
    </motion.div>
  );
}
