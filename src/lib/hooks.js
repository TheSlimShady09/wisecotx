import { useEffect, useRef, useState } from "react";

/** True when the browser can actually give us a WebGL context. */
export function useWebGL() {
  const [supported, setSupported] = useState(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setSupported(Boolean(gl));
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return reduced;
}

/**
 * Latches true once the element first gets near the viewport.
 *
 * Carries a safety net for the same reason Reveal does: if the observer
 * never fires, the stage would sit empty forever. Late-loading the 3D is
 * recoverable; never loading it is not.
 */
export function useNearViewport(rootMargin = "300px") {
  const ref = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || near) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);

    // if nothing has fired by now, assume the observer cannot see this
    // element and mount anyway rather than leaving a hole in the page
    const failsafe = window.setTimeout(() => setNear(true), 4000);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [near, rootMargin]);

  return [ref, near];
}

/**
 * Tracks visibility continuously (unlike useNearViewport, which latches).
 * Used to park the render loop while the canvas is off-screen.
 */
export function useIsVisible(ref) {
  // kept as two independent facts and ANDed, so neither source can
  // overwrite the other's state
  const [onScreen, setOnScreen] = useState(true);
  const [tabActive, setTabActive] = useState(true);
  const everSeen = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries[0]?.isIntersecting ?? true;
        if (intersecting) {
          everSeen.current = true;
          setOnScreen(true);
          return;
        }
        // Only park a canvas we have actually watched come into view.
        // Before that, a "not intersecting" report may just mean the
        // element had no box yet — parking on it would freeze a canvas
        // that never gets to draw its first frame.
        setOnScreen(!everSeen.current);
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    const sync = () => setTabActive(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  return onScreen && tabActive;
}

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

const THEME_KEY = "wcg-theme";

/** The active sheet, plus a toggle. An explicit choice is written to
    `data-theme` on <html> and remembered; with nothing chosen the page
    follows the OS, so this only latches once the visitor picks one. */
export function useTheme() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const sync = () => {
      const chosen = document.documentElement.dataset.theme;
      setTheme(chosen || (mq.matches ? "light" : "dark"));
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode — the choice just does not survive the session */
    }
    setTheme(next);
  };

  return [theme, toggle];
}
