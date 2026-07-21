import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { COMPANY, MODULES, MODULE_ORDER } from "../lib/site.js";
import { WhatsAppGlyph } from "./WhatsApp.jsx";
import { waLink } from "../lib/whatsapp.js";

function Mark() {
  return (
    <Link to="/" className="mark" aria-label={`${COMPANY.name} — home`}>
      <svg viewBox="0 0 28 22" aria-hidden="true" className="mark__glyph">
        <path d="M2 12 L14 2 L26 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M6 20 L14 8 L22 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" opacity="0.45" />
      </svg>
      <span className="mark__text">
        Wise Co<span className="mark__thin"> Group</span>
      </span>
    </Link>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="nav__inner shell shell--wide">
        <Mark />

        <nav className="nav__links" aria-label="Main">
          {MODULE_ORDER.map((id) => (
            <NavLink key={id} to={`/${id}`} className={({ isActive }) => `nav__link ${isActive ? "is-active" : ""}`}>
              <span className="nav__link-code anno--dim">{MODULES[id].code}</span>
              {MODULES[id].label}
            </NavLink>
          ))}
        </nav>

        <div className="nav__end">
          <a
            className="nav__wa"
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message us on WhatsApp"
            title="WhatsApp"
          >
            <WhatsAppGlyph size={17} />
          </a>
          <a className="nav__phone anno" href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}>
            {COMPANY.phone}
          </a>
          <Link to="/quote" className="btn btn--solid nav__cta">
            Free estimate
          </Link>
          <button
            type="button"
            className="nav__burger"
            aria-expanded={open}
            aria-controls="nav-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className={`nav__burger-bars ${open ? "is-open" : ""}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div id="nav-drawer" className={`nav__drawer ${open ? "is-open" : ""}`} hidden={!open}>
        <div className="nav__drawer-inner">
          {MODULE_ORDER.map((id) => (
            <Link key={id} to={`/${id}`} className="nav__drawer-link">
              <span className="anno--dim">{MODULES[id].code}</span>
              <span>{MODULES[id].label}</span>
              <span className="nav__drawer-note">{MODULES[id].tagline}</span>
            </Link>
          ))}
          <Link to="/quote" className="btn btn--solid btn--lg nav__drawer-cta">
            Request a free estimate
          </Link>
          <a className="btn btn--lg nav__drawer-wa" href={waLink()} target="_blank" rel="noopener noreferrer">
            <WhatsAppGlyph />
            Chat on WhatsApp
          </a>
          <a className="anno nav__drawer-phone" href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}>
            {COMPANY.phone} · {COMPANY.hours}
          </a>
        </div>
      </div>
    </header>
  );
}
