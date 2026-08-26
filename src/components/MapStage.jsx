import { Suspense, lazy, useEffect, useState } from "react";

import { useIsVisible, useMediaQuery, useNearViewport, usePrefersReducedMotion, useWebGL } from "../lib/hooks.js";
import { MAPBOX_TOKEN } from "../lib/mapbox.js";

const MapScene = lazy(() => import("../three/MapScene.jsx"));
const MapboxMap = lazy(() => import("./MapboxMap.jsx"));

/* Static blueprint fallback: a grid with a pin, for no-WebGL / loading. */
function StaticMap() {
  return (
    <div className="fallback">
      <div>
        <svg viewBox="0 0 400 260" role="img" aria-label="Map of the service area with the location marked">
          <g stroke="currentColor" strokeWidth="1" opacity="0.35">
            {[40, 90, 140, 190, 240].map((y) => (
              <path key={`h${y}`} d={`M20 ${y} L380 ${y}`} />
            ))}
            {[60, 120, 180, 240, 300, 360].map((x) => (
              <path key={`v${x}`} d={`M${x} 30 L${x} 250`} />
            ))}
          </g>
          <circle cx="200" cy="150" r="46" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <circle cx="200" cy="150" r="78" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.22" />
          <g fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M200 150 L200 96" />
          </g>
          <circle cx="200" cy="92" r="8" fill="currentColor" />
        </svg>
        <p className="fallback__note">DFW metroplex · service area</p>
      </div>
    </div>
  );
}

export default function MapStage({ className = "" }) {
  const [ref, near] = useNearViewport();
  const visible = useIsVisible(ref);
  const webgl = useWebGL();
  const reducedMotion = usePrefersReducedMotion();
  const phone = useMediaQuery("(max-width: 640px)");

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

  // a real Mapbox dark map when a token is configured; otherwise the
  // procedural blueprint map. If Mapbox fails to initialise (auth, WebGL,
  // whatever) we drop to the procedural map rather than showing an error.
  const [mapboxFailed, setMapboxFailed] = useState(false);
  const useMapbox = Boolean(MAPBOX_TOKEN) && !mapboxFailed;
  const mountNear = near && (!phone || inView);
  const canRender3D = mountNear && (useMapbox || webgl === true);

  return (
    <div ref={ref} className={`stage ${className} ${useMapbox ? "stage--map" : ""}`}>
      <div className="stage__frame" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      {canRender3D ? (
        <Suspense fallback={<StaticMap />}>
          {useMapbox ? (
            <MapboxMap reducedMotion={reducedMotion} onError={() => setMapboxFailed(true)} />
          ) : (
            <MapScene reducedMotion={reducedMotion} lowPower={phone} frameloop={visible ? "always" : "never"} />
          )}
        </Suspense>
      ) : (
        <StaticMap />
      )}
    </div>
  );
}
