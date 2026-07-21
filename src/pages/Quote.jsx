import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Reveal from "../components/Reveal.jsx";
import { SpecTable } from "../components/ModuleKit.jsx";
import { WhatsAppButton } from "../components/WhatsApp.jsx";
import { COMPANY, MODULES, MODULE_ORDER } from "../lib/site.js";
import { useQuote } from "../lib/QuoteContext.jsx";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY = { name: "", email: "", phone: "", location: "", module: "construction", message: "", consent: false };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "We need a name to put on the file.";
  if (!values.email.trim()) errors.email = "An email address, so we can send the written quote.";
  else if (!EMAIL.test(values.email.trim())) errors.email = "That address does not look complete.";
  if (!values.location.trim()) errors.location = "A town or postcode — it decides which crew comes out.";
  if (!values.consent) errors.consent = "We need your permission to reply.";
  return errors;
}

export default function Quote() {
  const { brief, setBrief } = useQuote();
  const [values, setValues] = useState(() => ({ ...EMPTY, module: brief?.module ?? "construction" }));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState(null);
  const successRef = useRef(null);

  const isB2B = values.module === "insurance";

  useEffect(() => {
    if (brief?.module) setValues((v) => ({ ...v, module: brief.module }));
  }, [brief]);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  const summaryRows = useMemo(
    () => (brief?.summary ?? []).map(([k, v]) => [k, v]),
    [brief],
  );

  const update = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length) {
      const first = document.querySelector(`[name="${Object.keys(found)[0]}"]`);
      first?.focus();
      return;
    }

    // No backend is wired yet — swap this for your CRM / form endpoint.
    setReference(`WCG-${Math.floor(100000 + Math.random() * 899999)}`);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="band band--tall">
        <div className="shell">
          <div className="done" tabIndex={-1} ref={successRef}>
            <span className="anno--dim">{reference}</span>
            <h1 className="done__title">Received. We will be in touch.</h1>
            <p className="prose">
              {isB2B
                ? "Your enquiry is with our carrier services desk. Expect a reply with certificates, sample scopes and capacity within one business day."
                : `A member of the estimating team will call you within one business day to arrange the site visit. If it is urgent, call ${COMPANY.phone} and quote that reference.`}
            </p>
            {summaryRows.length ? <SpecTable className="done__spec" rows={summaryRows} /> : null}
            <div className="btn-row done__actions">
              <Link to="/" className="btn">
                Back to the start
              </Link>
              <WhatsAppButton module={values.module} summary={summaryRows} label="Continue on WhatsApp" />
              <a className="btn" href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}>
                {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="band band--tall">
      <div className="shell quote">
        <div className="quote__intro">
          <Reveal>
            <h1 className="quote__title">{isB2B ? "Open a subcontractor account." : "Get a free estimate."}</h1>
            <p className="lede">
              {isB2B
                ? "Tell us what you place and where. We will come back with certificates, sample scopes, capacity and rates."
                : "No charge, no obligation, and no salesperson sitting in your kitchen for two hours. We look, we measure, we send a written price."}
            </p>
          </Reveal>

          {summaryRows.length ? (
            <Reveal delay={0.08} className="quote__brief">
              <div className="quote__brief-head">
                <span className="anno">Attached configuration</span>
                <button type="button" className="btn btn--ghost quote__clear" onClick={() => setBrief(null)}>
                  Clear
                </button>
              </div>
              <SpecTable rows={summaryRows} />
            </Reveal>
          ) : (
            <Reveal delay={0.08} className="quote__brief quote__brief--empty">
              <p className="prose">
                Nothing attached yet. You can{" "}
                <Link to="/construction" className="link">
                  configure a roof
                </Link>{" "}
                or{" "}
                <Link to="/repair" className="link">
                  pick a fault
                </Link>{" "}
                first and the spec will travel with your enquiry — or just fill this in and we will work it out on the
                phone.
              </p>
            </Reveal>
          )}

          <Reveal delay={0.14}>
            <SpecTable
              className="quote__contact"
              rows={[
                [
                  "Phone",
                  <a key="phone" href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}>
                    {COMPANY.phone}
                  </a>,
                ],
                [
                  "Email",
                  <a key="email" href={`mailto:${COMPANY.email}`}>
                    {COMPANY.email}
                  </a>,
                ],
                ["Hours", COMPANY.hours],
                ["Emergencies", "24/7 call-out"],
              ]}
            />
          </Reveal>
        </div>

        <Reveal delay={0.06} className="quote__form-wrap">
          <form className="quote__form" onSubmit={onSubmit} noValidate>
            <div className="field-grid">
              <div className={`field ${errors.name ? "field--invalid" : ""}`}>
                <label className="field__label" htmlFor="q-name">
                  {isB2B ? "Your name" : "Name"}
                </label>
                <input
                  id="q-name"
                  name="name"
                  value={values.name}
                  onChange={update("name")}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "err-name" : undefined}
                />
                {errors.name ? (
                  <span className="field__error" id="err-name">
                    {errors.name}
                  </span>
                ) : null}
              </div>

              <div className={`field ${errors.email ? "field--invalid" : ""}`}>
                <label className="field__label" htmlFor="q-email">
                  {isB2B ? "Work email" : "Email"}
                </label>
                <input
                  id="q-email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={update("email")}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "err-email" : undefined}
                />
                {errors.email ? (
                  <span className="field__error" id="err-email">
                    {errors.email}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="field-grid">
              <div className="field">
                <label className="field__label" htmlFor="q-phone">
                  Phone <span className="field__opt">optional</span>
                </label>
                <input
                  id="q-phone"
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={update("phone")}
                  autoComplete="tel"
                />
              </div>

              <div className={`field ${errors.location ? "field--invalid" : ""}`}>
                <label className="field__label" htmlFor="q-location">
                  {isB2B ? "Territory" : "Town or postcode"}
                </label>
                <input
                  id="q-location"
                  name="location"
                  value={values.location}
                  onChange={update("location")}
                  autoComplete="address-level2"
                  aria-invalid={Boolean(errors.location)}
                  aria-describedby={errors.location ? "err-location" : undefined}
                />
                {errors.location ? (
                  <span className="field__error" id="err-location">
                    {errors.location}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="q-module">
                What is this about?
              </label>
              <select id="q-module" name="module" value={values.module} onChange={update("module")}>
                {MODULE_ORDER.map((id) => (
                  <option key={id} value={id}>
                    {MODULES[id].label} — {MODULES[id].tagline}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="q-message">
                Anything we should know <span className="field__opt">optional</span>
              </label>
              <textarea
                id="q-message"
                name="message"
                value={values.message}
                onChange={update("message")}
                placeholder={
                  isB2B
                    ? "Volume, territories, portal or feed you use, and whether you need storm surge capacity."
                    : "Age of the roof, what you have noticed, and whether it is currently leaking."
                }
              />
            </div>

            <label className={`toggle toggle--consent ${errors.consent ? "is-invalid" : ""}`}>
              <input type="checkbox" name="consent" checked={values.consent} onChange={update("consent")} />
              <span className="toggle__box" aria-hidden="true" />
              <span className="toggle__text">
                You can contact me about this enquiry.
                <span className="toggle__note anno--dim">We do not sell your details or add you to a mailing list.</span>
              </span>
            </label>
            {errors.consent ? <span className="field__error">{errors.consent}</span> : null}

            <button type="submit" className="btn btn--solid btn--lg quote__submit">
              {isB2B ? "Send enquiry" : "Request my free estimate"}
              <span className="btn-arrow" aria-hidden="true">
                →
              </span>
            </button>
            <p className="quote__small anno--dim">Typical reply time: under one business day</p>

            <div className="quote__alt">
              <span className="quote__alt-rule anno--dim">or</span>
              <WhatsAppButton
                module={values.module}
                summary={summaryRows}
                label="Send it on WhatsApp instead"
                className="quote__alt-btn"
              />
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
