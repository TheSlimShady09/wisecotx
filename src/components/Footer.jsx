import { Link } from "react-router-dom";

import { ACCREDITATIONS, COMPANY, MODULES, MODULE_ORDER } from "../lib/site.js";
import { WhatsAppButton } from "./WhatsApp.jsx";
import { waLink } from "../lib/whatsapp.js";

export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell shell--wide">
        <div className="foot__top">
          <div className="foot__pitch">
            <h2 className="foot__title">Get it priced before you commit.</h2>
            <p className="prose">
              A free estimate costs you a phone call and about twenty minutes on site. We will tell you if you do not need
              the work.
            </p>
            <div className="btn-row foot__actions">
              <Link to="/quote" className="btn btn--solid btn--lg">
                Request a free estimate
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
              <WhatsAppButton module="construction" label="WhatsApp us" className="btn--lg" />
              <a className="btn btn--lg" href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}>
                {COMPANY.phone}
              </a>
            </div>
          </div>

          <div className="foot__cols">
            <div>
              <p className="anno--dim foot__col-head">Services</p>
              <ul className="foot__list">
                {MODULE_ORDER.map((id) => (
                  <li key={id}>
                    <Link to={`/${id}`}>{MODULES[id].label}</Link>
                  </li>
                ))}
                <li>
                  <Link to="/quote">Free estimate</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="anno--dim foot__col-head">Credentials</p>
              <ul className="foot__list foot__list--plain">
                {ACCREDITATIONS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="anno--dim foot__col-head">Contact</p>
              <ul className="foot__list">
                <li>
                  <a href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}>{COMPANY.phone}</a>
                </li>
                <li>
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                </li>
                <li>
                  <a href={waLink()} target="_blank" rel="noopener noreferrer">
                    WhatsApp {COMPANY.whatsappLabel}
                  </a>
                </li>
                <li className="foot__muted">{COMPANY.hours}</li>
                <li className="foot__muted">Emergency call-out 24/7</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="foot__base">
          <span className="anno--dim">
            © {new Date().getFullYear()} {COMPANY.name}
          </span>
          <span className="anno--dim">{COMPANY.license}</span>
          <span className="anno--dim">Licensed · Bonded · Insured</span>
        </div>
      </div>
    </footer>
  );
}
