import { Suspense, lazy, useEffect, useState } from "react";

import StaticHouse from "./StaticHouse.jsx";
import { useIsVisible, useMediaQuery, useNearViewport, usePrefersReducedMotion, useWebGL } from "../lib/hooks.js";

/* The entire three.js dependency tree lives behind this import, so
   it is fetched only once the stage is close to the viewport. */
const Scene = lazy(() => import("../three/Scene.jsx"));

export default function CanvasStage({
  className = "",
  fallbackNote,
  forceStatic = false,
  // tagLeft / tagRight are still accepted from call sites but no longer
  // rendered — they land in `rest` and are harmlessly ignored
  tagLeft: _tagLeft,
  tagRight: _tagRight,
  ...house
}) {
  const [ref, near] = useNearViewport();
  const visible = useIsVisible(ref);
  const webgl = useWebGL();
  const reducedMotion = usePrefersReducedMotion();
  const phone = useMediaQuery("(max-width: 640px)");

  /* Non-latching "is this near the viewport right now". On phones we use
     it to unmount a canvas once it scrolls away, so only the stage you
     are actually looking at holds a live WebGL context — the rest fall
     back to the drawing. Desktops keep every canvas mounted (the latched
     `near`), since holding a few contexts there is cheap. */
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => setInView(entries[0]?.isIntersecting ?? false), {
      rootMargin: "300px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  const canRender3D = !forceStatic && webgl === true && near && (!phone || inView);

  return (
    <div ref={ref} className={`stage ${className}`}>
      <div className="stage__frame" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      {canRender3D ? (
        <Suspense fallback={<StaticHouse note={fallbackNote} />}>
          {/* the loop parks itself when the canvas scrolls away or the
              tab is backgrounded — no GPU burn for something nobody sees */}
          <Scene
            {...house}
            reducedMotion={reducedMotion}
            lowPower={phone}
            frameloop={visible ? "always" : "never"}
          />
        </Suspense>
      ) : (
        <StaticHouse note={fallbackNote} />
      )}
    </div>
  );
}
