import { useState } from "react";
import { Link } from "react-router-dom";

import CanvasStage from "../components/CanvasStage.jsx";
import Reveal from "../components/Reveal.jsx";
import { WhatsAppButton } from "../components/WhatsApp.jsx";
import { stagePropsForModule } from "../lib/scene.js";
import { ACCREDITATIONS, CREDENTIALS, MODULES, MODULE_ORDER, MODULE_PREVIEW, PROJECTS, TESTIMONIALS } from "../lib/site.js";

function ChoiceCard({ id, active, onEnter, onLeave }) {
  const module = MODULES[id];
  const isActive = active === id;

  return (
    <a
      href={`#${id}`}
      className={`choice ${isActive ? "is-active" : ""} ${active && !isActive ? "is-dimmed" : ""}`}
      onMouseEnter={() => onEnter(id)}
      onMouseLeave={onLeave}
      onFocus={() => onEnter(id)}
      onBlur={onLeave}
    >
      <span className="choice__code anno--dim">{module.code}</span>
      <span className="choice__label">{module.label}</span>
      <span className="choice__tagline">{module.tagline}</span>

      <span className="choice__reveal">
        <span className="choice__reveal-inner">
          <span className="choice__line">{module.hoverLine}</span>
          <span className="choice__go">
            See how it works
            <span className="btn-arrow" aria-hidden="true">
              ↓
            </span>
          </span>
        </span>
      </span>
    </a>
  );
}

/* ------------------------------------------------------------
   One section per module, each carrying its own 3D house
   dressed for that job. Sections alternate side so the page
   has a rhythm rather than three identical slabs.
   ------------------------------------------------------------ */
function ModuleSection({ id, index }) {
  const module = MODULES[id];
  const preview = MODULE_PREVIEW[id];

  return (
    <section id={id} className={`mpreview ${index % 2 ? "mpreview--flip" : ""}`} aria-labelledby={`${id}-title`}>
      <div className="shell shell--wide mpreview__grid">
        <div className="mpreview__stage-col">
          <CanvasStage
            className="mpreview__stage"
            tagLeft={`${module.code} · ${module.label}`}
            tagRight={preview.scene.hotspotsFrom ? "Marked up" : "Specimen"}
            fallbackNote={`${module.label} — ${module.tagline}`}
            staticOnPhone
            {...stagePropsForModule(id)}
          />
        </div>

        <div className="mpreview__body">
          <Reveal>
            <div className="mpreview__meta">
              <span className="anno--dim">{module.code}</span>
              <span className="mpreview__divider" aria-hidden="true" />
              <span className="anno">{module.label}</span>
            </div>
            <h2 id={`${id}-title`} className="mpreview__title">
              {preview.heading}
            </h2>
            <p className="mpreview__lead">{preview.lead}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="mpreview__points">
              {preview.highlights.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.14} className="btn-row mpreview__actions">
            <Link to={`/${id}`} className="btn btn--solid btn--lg">
              {preview.cta}
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <WhatsAppButton module={id} label="Ask on WhatsApp" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const [active, setActive] = useState(null);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__grid shell shell--wide">
          <div className="hero__head">
            <h1 id="hero-title">
              Where do you need help
              <br />
              with your roof?
            </h1>
            <p className="hero__sub">
              One team for all three: we build roofs new, repair the ones that fail, and handle roofing claims as a
              subcontractor for insurance carriers.
            </p>
          </div>

          <div className="hero__stage-wrap">
            {/* the drawing, not the model — the three sections below each
                run a real 3D house, and four live canvases on one page is
                three too many */}
            <CanvasStage
              className="hero__stage"
              forceStatic
              tagLeft="Elevation"
              tagRight="WCG-STD-01"
              fallbackNote="Wise Co Group — standard gable, chimney to the east"
            />
          </div>

          <div className="hero__choices" role="group" aria-label="Choose the help you need">
            {MODULE_ORDER.map((id) => (
              <ChoiceCard key={id} id={id} active={active} onEnter={setActive} onLeave={() => setActive(null)} />
            ))}
          </div>
        </div>
      </section>

      {MODULE_ORDER.map((id, i) => (
        <ModuleSection key={id} id={id} index={i} />
      ))}

      {/* ---------- credentials ---------- */}
      <section className="band" aria-labelledby="credentials-title">
        <div className="shell">
          <Reveal className="head">
            <h2 id="credentials-title">
              Eighteen years on other people&rsquo;s roofs, and a licence we would rather not lose.
            </h2>
            <p>
              Everything below is verifiable. Ask for the certificates before you sign anything, with us or with anyone
              else.
            </p>
          </Reveal>

          <div className="stat-row">
            {CREDENTIALS.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.07} className="stat">
                <span className="stat__value mono-num">
                  {item.value}
                  <span className="stat__unit">{item.unit}</span>
                </span>
                <span className="stat__label">{item.label}</span>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <ul className="cred-list">
              {ACCREDITATIONS.map((item) => (
                <li key={item}>
                  <span aria-hidden="true" className="cred-list__tick">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* ---------- projects ---------- */}
      <section className="band" aria-labelledby="projects-title">
        <div className="shell">
          <Reveal className="anno-rule">
            <span className="anno">Recent work</span>
          </Reveal>
          <Reveal className="head">
            <h2 id="projects-title">Completed, signed off, warranted.</h2>
          </Reveal>

          <div className="projects">
            {PROJECTS.map((project, i) => (
              <Reveal key={project.ref} delay={(i % 3) * 0.06} className="project">
                <Link to={`/${project.module}`} className="project__link">
                  <span className="project__ref anno--dim">{project.ref}</span>
                  <span className="project__title">{project.title}</span>
                  <span className="project__spec anno">{project.spec}</span>
                  <span className="project__module">{MODULES[project.module].label}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- testimonials ---------- */}
      <section className="band" aria-labelledby="voices-title">
        <div className="shell">
          <Reveal className="head">
            <h2 id="voices-title">What they said afterwards.</h2>
          </Reveal>

          <div className="voices">
            {TESTIMONIALS.map((item, i) => (
              <Reveal key={item.name} delay={i * 0.08} className="voice" as="figure">
                <blockquote className="voice__quote">{item.quote}</blockquote>
                <figcaption className="voice__by">
                  <span className="voice__name">{item.name}</span>
                  <span className="anno--dim">{item.role}</span>
                </figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
