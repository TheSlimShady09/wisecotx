import { useEffect, useRef } from "react";

import { COMPANY } from "../lib/site.js";
import { MAP_CENTER as CENTER, MAPBOX_TOKEN } from "../lib/mapbox.js";

export default function MapboxMap({ reducedMotion = false, onError }) {
  const containerRef = useRef(null);
  // kept in a ref so a changing callback identity never re-inits the map
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return undefined;

    let map;
    let cancelled = false;
    let spinRAF;
    const fail = (reason) => {
      if (!cancelled) onErrorRef.current?.(reason);
    };

    (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        await import("mapbox-gl/dist/mapbox-gl.css");
        if (cancelled || !containerRef.current) return;

        if (!mapboxgl.supported || mapboxgl.supported()) {
          // ok — some builds drop supported(); treat missing as supported
        } else {
          fail("WebGL not supported");
          return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;
        map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/standard",
          center: CENTER,
          zoom: 16.3,
          pitch: 64,
          bearing: -20,
          antialias: true,
          cooperativeGestures: true,
        });

        // only a genuinely fatal error (auth / renderer) drops us to the
        // fallback map; a tile hiccup is ignored
        map.on("error", (e) => {
          const msg = e?.error?.message || String(e?.error || "");
          if (/unauthor|forbidden|access token|webgl|context|401|403|failed to init/i.test(msg)) {
            fail(msg);
          }
        });

        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
        map.scrollZoom.disable();

        map.on("style.load", () => {
          try {
            map.setConfigProperty("basemap", "lightPreset", "night");
            map.setConfigProperty("basemap", "show3dObjects", true);
          } catch {
            /* style config API differs by version — non-fatal */
          }

          const el = document.createElement("div");
          el.className = "mapbox-pin";
          el.setAttribute("aria-label", COMPANY.fullName);
          new mapboxgl.Marker({ element: el, anchor: "bottom" })
            .setLngLat(CENTER)
            .setPopup(
              new mapboxgl.Popup({ offset: 22, closeButton: false }).setHTML(
                `<strong>${COMPANY.short}</strong><span>${COMPANY.address.line1}, ${COMPANY.address.city}</span>`,
              ),
            )
            .addTo(map);
        });

        if (!reducedMotion) {
          let interacting = false;
          for (const ev of ["mousedown", "touchstart", "dragstart", "wheel"]) {
            map.on(ev, () => {
              interacting = true;
            });
          }
          const spin = () => {
            if (cancelled) return;
            if (!interacting && map && !map.isMoving()) {
              map.setBearing(map.getBearing() + 0.05);
            }
            spinRAF = requestAnimationFrame(spin);
          };
          map.on("load", () => {
            spinRAF = requestAnimationFrame(spin);
          });
        }
      } catch (err) {
        fail(err?.message || String(err));
      }
    })();

    return () => {
      cancelled = true;
      if (spinRAF) cancelAnimationFrame(spinRAF);
      if (map) {
        try {
          map.remove();
        } catch {
          /* already gone */
        }
      }
    };
  }, [reducedMotion]);

  return <div ref={containerRef} className="mapbox" />;
}
