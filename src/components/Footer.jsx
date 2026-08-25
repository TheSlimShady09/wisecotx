import { Link } from "react-router-dom";

import { ACCREDITATIONS, COMPANY, MODULES, MODULE_ORDER } from "../lib/site.js";

/* Monochrome social glyphs — drawn in the page's own ink to hold the
   strictly-grayscale palette. */
const SOCIAL = [
  {
    label: "Facebook",
    href: COMPANY.social.facebook,
    icon: (
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.63c-.29-.04-1.28-.13-2.44-.13-2.42 0-4.07 1.48-4.07 4.19V9.9H7.45V13h2.73v8h3.32z" />
    ),
  },
  {
    label: "Instagram",
    href: COMPANY.social.instagram,
    icon: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="3.9" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="16.9" cy="7.1" r="1.15" />
      </>
    ),
  },
  {
    label: "YouTube",
    href: COMPANY.social.youtube,
    icon: (
      <path d="M22 8.2s-.2-1.42-.8-2.05c-.76-.8-1.6-.8-2-.85C16.4 5.05 12 5.05 12 5.05h0s-4.4 0-7.2.25c-.4.05-1.24.05-2 .85-.6.63-.8 2.05-.8 2.05S1.8 9.87 1.8 11.54v.92c0 1.67.2 3.34.2 3.34s.2 1.42.8 2.05c.76.8 1.76.77 2.2.86 1.6.15 6.8.2 6.8.2s4.4-.01 7.2-.26c.4-.05 1.24-.05 2-.85.6-.63.8-2.05.8-2.05s.2-1.67.2-3.34v-.92c0-1.67-.2-3.34-.2-3.34zM9.9 14.6V9.4l4.5 2.6-4.5 2.6z" />
    ),
  },
];

export default function Footer() {
  return (
    <footer className="foot">
      <div className="shell shell--wide">
        <div className="foot__top">
          <div className="foot__pitch">
            <h2 className="foot__title">Get it inspected before you commit.</h2>
            <p className="prose">
              {COMPANY.fullName} is a turn-key roofing and restoration general contractor for the {COMPANY.region}. Book a
              free inspection — we will tell you if you do not need the work.
            </p>
            <div className="btn-row foot__actions">
              <Link to="/quote" className="btn btn--solid btn--lg">
                Request a free inspection
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
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
                  <Link to="/quote">Free inspection</Link>
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
                <li className="foot__muted">{COMPANY.address.city}</li>
                <li className="foot__muted">{COMPANY.hours}</li>
              </ul>

              <div className="foot__social">
                {SOCIAL.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="foot__social-link"
                    aria-label={label}
                    title={label}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      {icon}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="foot__base">
          <span className="anno--dim">
            © {new Date().getFullYear()} {COMPANY.name}
          </span>
          <span className="anno--dim">{COMPANY.license}</span>
          <span className="anno--dim">Licensed · Bonded · Insured</span>
          <a
            className="anno--dim foot__powered"
            href="https://neolink.al"
            target="_blank"
            rel="noopener noreferrer"
          >
            Powered by Neolink
          </a>
        </div>
      </div>
    </footer>
  );
}
