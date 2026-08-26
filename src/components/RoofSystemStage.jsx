import { Suspense, lazy, useEffect, useState } from "react";

import { useIsVisible, useMediaQuery, useNearViewport, usePrefersReducedMotion, useWebGL } from "../lib/hooks.js";
import { ROOF_LAYERS, ROOF_LAYERS_BY_ID } from "../lib/roofLayers.js";

const RoofSystemScene = lazy(() => import("../three/RoofSystemScene.jsx"));

const LAYERS = [...ROOF_LAYERS].reverse().map((l) => l.label);

/* Blueprint fallback: a stacked-layers legend for no-WebGL / loading. */
function StaticSystem() {
  return (
    <div className="fallback">
      <div>
        <svg viewBox="0 0 320 220" role="img" aria-label="Exploded diagram of a roof system's layers">
          <g stroke="currentColor" strokeWidth="1.2" fill="none">
            {LAYERS.map((_, i) => {
              const y = 30 + i * 28;
              return <path key={i} d={`M70 ${y} l90 -26 l90 26 l-90 26 Z`} opacity={0.35 + i * 0.09} />;
            })}
          </g>
        </svg>
        <p className="fallback__note">WCG total roofing system — six layers</p>
      </div>
    </div>
  );
}

export default function RoofSystemStage({ className = "" }) {
  const [ref, near] = useNearViewport();
  const visible = useIsVisible(ref);
  const webgl = useWebGL();
  const reducedMotion = usePrefersReducedMotion();
  const phone = useMediaQuery("(max-width: 640px)");

  const [selected, setSelected] = useState(null);
  const active = selected ? ROOF_LAYERS_BY_ID[selected] : null;

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

  const canRender3D = webgl === true && near && (!phone || inView);

  return (
    <>
      <div ref={ref} className={`stage ${className}`}>
        <div className="stage__frame" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        {canRender3D ? (
          <Suspense fallback={<StaticSystem />}>
            <RoofSystemScene
              reducedMotion={reducedMotion}
              lowPower={phone}
              frameloop={visible ? "always" : "never"}
              selectedId={selected}
              onSelect={setSelected}
            />
          </Suspense>
        ) : (
          <StaticSystem />
        )}
      </div>

      {canRender3D ? (
        <div className={`roofsys-info ${active ? "is-open" : ""}`} aria-live="polite">
          {active ? (
            <>
              <span className="roofsys-info__role mono-num">{active.role}</span>
              <h3 className="roofsys-info__title">{active.label}</h3>
              <p className="roofsys-info__text">{active.desc}</p>
            </>
          ) : (
            <span className="roofsys-info__hint">Click a layer in the model to see what it does</span>
          )}
        </div>
      ) : null}
    </>
  );
}
