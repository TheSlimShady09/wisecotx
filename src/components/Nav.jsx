import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { COMPANY, MODULES, MODULE_ORDER } from "../lib/site.js";

/* The three module pages live under a "Services" dropdown, not as their
   own top-level items. */
const MODULE_MENU = MODULE_ORDER.map((id) => ({ label: MODULES[id].label, to: `/${id}`, note: MODULES[id].tagline }));
const SECTIONS = [
  { label: "Projects", to: "/#projects", note: "Recent jobs" },
  { label: "About", to: "/#about", note: "Who we are" },
  { label: "Contact", to: "/#contact", note: "Reach us" },
];

function Mark() {
  return (
    <Link to="/" className="mark" aria-label={`${COMPANY.name} — home`}>
      <img className="mark__img" src="/wcg-logo.png" alt={COMPANY.name} width="120" height="120" />
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
          <div className="nav__drop-wrap">
            <Link to="/#services" className="nav__link nav__drop-btn" aria-haspopup="true">
              Services
              <span className="nav__drop-caret" aria-hidden="true">
                ▾
              </span>
            </Link>
            <div className="nav__drop" role="menu">
              {MODULE_MENU.map((m) => (
                <Link key={m.to} to={m.to} className="nav__drop-link" role="menuitem">
                  <span className="nav__drop-name">{m.label}</span>
                  <span className="nav__drop-note">{m.note}</span>
                </Link>
              ))}
            </div>
          </div>
          {SECTIONS.map((s) => (
            <Link key={s.to} to={s.to} className="nav__link">
              {s.label}
            </Link>
          ))}
        </nav>

        <div className="nav__end">
          <a className="nav__phone anno" href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}>
            {COMPANY.phone}
          </a>
          <Link to="/quote" className="btn btn--solid nav__cta">
            Free inspection
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
          {[{ label: "Services", to: "/#services" }, ...MODULE_MENU, ...SECTIONS].map((item) => (
            <Link key={item.to} to={item.to} className="nav__drawer-link">
              <span>{item.label}</span>
            </Link>
          ))}
          <Link to="/quote" className="btn btn--solid btn--lg nav__drawer-cta">
            Request a free inspection
          </Link>
          <a className="anno nav__drawer-phone" href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}>
            {COMPANY.phone} · {COMPANY.hours}
          </a>
        </div>
      </div>
    </header>
  );
}
