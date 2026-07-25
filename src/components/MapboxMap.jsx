import { useEffect, useRef } from "react";

import { COMPANY } from "../lib/site.js";
import { MAP_CENTER as CENTER, MAPBOX_TOKEN } from "../lib/mapbox.js";

export default function MapboxMap({ reducedMotion = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return undefined;

    let map;
    let cancelled = false;
    let spinRAF;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");
      if (cancelled || !containerRef.current) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;
      // The Standard style ships real 3D buildings, landmarks and lighting
      // in GL JS v3 — no manual fill-extrusion layer needed, and it renders
      // 3D reliably (the classic dark style often showed a flat plate).
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

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
      map.scrollZoom.disable();

      map.on("style.load", () => {
        // dark mode + a bit of atmosphere, buildings already extruded
        try {
          map.setConfigProperty("basemap", "lightPreset", "night");
          map.setConfigProperty("basemap", "show3dObjects", true);
        } catch {
          /* older style config API — ignore */
        }

        // white marker at the location
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

      // a slow idle rotation until the visitor grabs it
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
    })();

    return () => {
      cancelled = true;
      if (spinRAF) cancelAnimationFrame(spinRAF);
      if (map) map.remove();
    };
  }, [reducedMotion]);

  return <div ref={containerRef} className="mapbox" />;
}
