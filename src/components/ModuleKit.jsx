import { useId } from "react";
import { Link, useNavigate } from "react-router-dom";

import Reveal from "./Reveal.jsx";
import { useQuote } from "../lib/QuoteContext.jsx";

/* ---------- page opener ---------- */
export function ModuleHero({ module, children }) {
  return (
    <section className="mhero">
      <div className="shell">
        <div className="mhero__meta">
          <span className="anno">{module.label}</span>
        </div>
        <h1 className="mhero__title">{module.title}</h1>
        <p className="mhero__blurb lede">{module.blurb}</p>
        {children}
      </div>
    </section>
  );
}

/* ---------- radio group, drawn as a spec sheet ---------- */
export function OptionSet({ legend, name, options, value, onChange, columns = 1 }) {
  const groupId = useId();

  return (
    <fieldset className="optset">
      <legend className="optset__legend anno">{legend}</legend>
      <div className="optset__list" data-columns={columns}>
        {options.map((option) => {
          const id = `${groupId}-${option.id}`;
          const checked = value === option.id;
          return (
            <div key={option.id} className={`opt ${checked ? "is-checked" : ""}`}>
              <input
                type="radio"
                id={id}
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="opt__input"
              />
              <label htmlFor={id} className="opt__label">
                <span className="opt__mark" aria-hidden="true" />
                <span className="opt__text">
                  <span className="opt__name">{option.label}</span>
                  {option.note || option.spec ? <span className="opt__note anno--dim">{option.note ?? option.spec}</span> : null}
                </span>
                {option.rate ? <span className="opt__rate mono-num">${option.rate.toFixed(2)}/ft²</span> : null}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ---------- key/value readout ---------- */
export function SpecTable({ rows, className = "" }) {
  return (
    <dl className={`spec ${className}`}>
      {rows.map(([key, val]) => (
        <div className="spec__row" key={key}>
          <dt className="spec__key anno--dim">{key}</dt>
          <dd className="spec__val">{val}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- native accordion, no JS needed ---------- */
export function Faq({ items, title = "Before you ask" }) {
  return (
    <section className="band" aria-labelledby="faq-title">
      <div className="shell">
        <Reveal className="head">
          <h2 id="faq-title">{title}</h2>
        </Reveal>
        <div className="faq">
          {items.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <details className="faq__item">
                <summary className="faq__q">
                  <span>{item.q}</span>
                  <span className="faq__sign" aria-hidden="true" />
                </summary>
                <div className="faq__a">
                  <p>{item.a}</p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- ordered process ---------- */
export function Process({ steps, title, intro }) {
  return (
    <section className="band" aria-labelledby="process-title">
      <div className="shell">
        <Reveal className="head">
          <h2 id="process-title">{title}</h2>
          {intro ? <p>{intro}</p> : null}
        </Reveal>

        <ol className="process">
          {steps.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.06} as="li" className="process__step">
              <span className="process__num mono-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="process__name">{step.step}</h3>
                <p className="prose">{step.detail}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * Hands the current configuration to the quote form, so the lead
 * arrives with a spec instead of a blank message box.
 */
export function TakeToQuote({ module, summary, label = "Request a free inspection", className = "", variant = "solid" }) {
  const { setBrief } = useQuote();
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={`btn ${variant === "solid" ? "btn--solid" : ""} btn--lg ${className}`}
      onClick={() => {
        setBrief({ module, summary });
        navigate("/quote");
      }}
    >
      {label}
      <span className="btn-arrow" aria-hidden="true">
        →
      </span>
    </button>
  );
}

export function ModuleSwitch({ current, modules, order }) {
  const others = order.filter((id) => id !== current);
  return (
    <section className="band band--tight">
      <div className="shell">
        <div className="anno-rule">
          <span className="anno">Not what you needed?</span>
        </div>
        <div className="switch">
          {others.map((id) => (
            <Link key={id} to={`/${id}`} className="switch__card">
              <span className="anno--dim">{modules[id].code}</span>
              <span className="switch__label">{modules[id].label}</span>
              <span className="switch__note">{modules[id].hoverLine}</span>
              <span className="switch__arrow btn-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
