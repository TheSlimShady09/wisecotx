import { Suspense, lazy } from "react";

import StaticHouse from "./StaticHouse.jsx";
import { useIsVisible, useMediaQuery, useNearViewport, usePrefersReducedMotion, useWebGL } from "../lib/hooks.js";

/* The entire three.js dependency tree lives behind this import, so
   it is fetched only once the stage is close to the viewport. */
const Scene = lazy(() => import("../three/Scene.jsx"));

export default function CanvasStage({
  className = "",
  fallbackNote,
  forceStatic = false,
  staticOnPhone = false,
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

  // On phones we render at most one live canvas at a time: decorative
  // stages (the landing sections) fall back to the drawing, and the ones
  // that stay 3D run in a lighter power profile.
  const canRender3D = !forceStatic && !(phone && staticOnPhone) && webgl === true && near;

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
