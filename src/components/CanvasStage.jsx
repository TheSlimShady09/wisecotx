import { Suspense, lazy } from "react";

import StaticHouse from "./StaticHouse.jsx";
import { useIsVisible, useNearViewport, usePrefersReducedMotion, useWebGL } from "../lib/hooks.js";

/* The entire three.js dependency tree lives behind this import, so
   it is fetched only once the stage is close to the viewport. */
const Scene = lazy(() => import("../three/Scene.jsx"));

export default function CanvasStage({ tagLeft, tagRight, className = "", fallbackNote, forceStatic = false, ...house }) {
  const [ref, near] = useNearViewport();
  const visible = useIsVisible(ref);
  const webgl = useWebGL();
  const reducedMotion = usePrefersReducedMotion();

  // forceStatic keeps the frame and tags but renders the drawing — used
  // where the chrome is wanted without spending a WebGL context on it
  const canRender3D = !forceStatic && webgl === true && near;

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
          <Scene {...house} reducedMotion={reducedMotion} frameloop={visible ? "always" : "never"} />
        </Suspense>
      ) : (
        <StaticHouse note={fallbackNote} />
      )}

      {tagLeft ? <span className="stage__tag">{tagLeft}</span> : null}
      {tagRight ? <span className="stage__tag stage__tag--right">{tagRight}</span> : null}
    </div>
  );
}
