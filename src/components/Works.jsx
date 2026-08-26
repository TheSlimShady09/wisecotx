import { useEffect, useRef } from "react";

import Reveal from "./Reveal.jsx";
import { COMPANY, WORKS } from "../lib/site.js";

function PlayGlyph() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 17 L32 24 L20 31 Z" fill="currentColor" />
    </svg>
  );
}

function PhotoGlyph() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="9" y="14" width="30" height="22" rx="2.5" />
      <path d="M9 30 L18 22 L26 29 L32 24 L39 30" />
      <circle cx="18" cy="20" r="2.2" />
      <path d="M18 14 L20 11 L28 11 L30 14" />
    </svg>
  );
}

/* Muted, no audio — the clips loop silently like a reel. `muted` is
   forced on the DOM node too, since React does not always reflect the
   muted prop, and browsers only allow autoplay when it is truly muted. */
function WorkVideo({ work }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
  }, []);

  return (
    <video
      ref={ref}
      src={work.src}
      poster={work.poster || undefined}
      muted
      loop
      autoPlay
      playsInline
      preload="metadata"
      controls={false}
      tabIndex={-1}
    />
  );
}

function WorkTile({ work }) {
  const isVideo = work.type === "video";
  return (
    <figure className="work__media">
      {work.src ? (
        isVideo ? (
          <WorkVideo work={work} />
        ) : (
          <img src={work.src} alt={work.title} loading="lazy" />
        )
      ) : (
        <div className="work__placeholder">{isVideo ? <PlayGlyph /> : <PhotoGlyph />}</div>
      )}

      <span className="work__badge anno--dim">{isVideo ? "Video" : "Photo"}</span>

      <figcaption className="work__cap">
        <span className="work__title">{work.title}</span>
        <span className="work__spec anno--dim">{work.spec}</span>
      </figcaption>
    </figure>
  );
}

export default function Works() {
  return (
    <section id="projects" className="band" aria-labelledby="works-title">
      <div className="shell">
        <Reveal className="anno-rule">
          <span className="anno">Projects</span>
        </Reveal>
        <Reveal className="head head--oneline">
          <h2 id="works-title">Roofs we have finished, and the work behind them.</h2>
          <p>Photographs and short clips from recent jobs across the {COMPANY.region}.</p>
        </Reveal>

        <div className="works">
          {WORKS.map((work, i) => (
            <Reveal key={work.id} delay={(i % 3) * 0.06} className="work">
              <WorkTile work={work} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
