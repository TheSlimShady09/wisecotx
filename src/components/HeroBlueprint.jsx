import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* The hero centrepiece: the WCG standard elevation that draws itself in,
   in construction order (ground, walls, roof, chimney, openings, then the
   dimension annotations), holds, erases and redraws — a blueprint that is
   perpetually being drawn. */

const EASE = [0.22, 1, 0.36, 1];

const container = {
  // erase quickly, in reverse order
  hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  // draw deliberately, in order
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const line = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (o = 1) => ({
    pathLength: 1,
    opacity: o,
    transition: { pathLength: { duration: 0.7, ease: EASE }, opacity: { duration: 0.25 } },
  }),
};

const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.7, transition: { duration: 0.4 } },
};

/* [d, opacity, strokeWidth] in construction order */
const PATHS = [
  ["M14 252 L386 252", 0.5, 1.25], // ground line
  ["M62 152 L62 252 L338 252 L338 152", 1, 1.25], // body / walls
  ["M30 152 L200 62 L370 152", 1, 1.6], // main roof
  ["M52 152 L200 74 L348 152", 0.45, 1.25], // roof underline
  ["M276 108 L276 60 L306 60 L306 124", 1, 1.25], // chimney
  ["M271 60 L311 60", 1, 2], // chimney cap
  ["M104 252 L104 196 L146 196 L146 252", 1, 1.25], // door
  ["M178 178 L178 214 L222 214 L222 178 Z", 1, 1.25], // window 1
  ["M254 178 L254 214 L298 214 L298 178 Z", 1, 1.25], // window 2
  ["M200 178 L200 214 M178 196 L222 196", 0.5, 1.25], // window 1 bars
  ["M276 178 L276 214 M254 196 L298 196", 0.5, 1.25], // window 2 bars
  ["M30 276 L370 276 M30 270 L30 282 M370 270 L370 282", 0.7, 1], // span dimension
  ["M14 62 L14 252 M8 62 L20 62 M8 252 L20 252", 0.7, 1], // height dimension
];

export default function HeroBlueprint() {
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = useState(false);

  // draw once when the page opens, then leave it standing
  useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return undefined;
    }
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  const state = drawn ? "visible" : "hidden";

  return (
    <div className="stage hero__stage hero-bp">
      <div className="stage__frame" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <motion.svg
        className="hero-bp__svg"
        viewBox="0 0 400 300"
        role="img"
        aria-label="Wise Construction Group — standard gable elevation"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeLinecap="round"
        variants={container}
        initial={reduced ? "visible" : "hidden"}
        animate={state}
      >
        {PATHS.map(([d, opacity, width], i) => (
          <motion.path key={i} d={d} strokeWidth={width} variants={line} custom={opacity} />
        ))}

        <motion.g variants={fade} className="hero-bp__labels">
          <text x="200" y="292" textAnchor="middle">
            SPAN
          </text>
          <text x="200" y="52" textAnchor="middle">
            RIDGE
          </text>
        </motion.g>
      </motion.svg>

      <span className="stage__tag hero-bp__tag">Elevation · WCG-STD-01</span>
    </div>
  );
}
