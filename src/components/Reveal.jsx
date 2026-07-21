import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/* A restrained scroll reveal.

   Deliberately NOT framer-motion's `whileInView`: a reveal must never be
   able to leave content invisible. If the observer never fires — the
   subtree was hidden when it mounted, the tab is in the background, a
   crawler or headless renderer is drawing the page — the safety timer
   shows the content anyway. A section arriving blank is a far worse
   failure than a missed animation.

   Under reduced motion it degrades to a plain crossfade rather than
   being removed: the content still arrives, it just stops travelling. */
export default function Reveal({ children, delay = 0, y = 18, as = "div", className, ...rest }) {
  const reduced = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );
    observer.observe(node);

    // the safety net: reveal regardless if nothing has fired by now
    const failsafe = window.setTimeout(() => setShown(true), 1600);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : y }}
      transition={{
        duration: reduced ? 0.2 : 0.7,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
