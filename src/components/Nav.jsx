import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { COMPANY, MODULES, MODULE_ORDER } from "../lib/site.js";

/* Module pages (own routes) + homepage sections (hash anchors), so the
   whole site is reachable from one menu instead of a long scroll. */
const PAGES = MODULE_ORDER.map((id) => ({ label: MODULES[id].label, to: `/${id}`, note: MODULES[id].tagline }));
const SECTIONS = [
  { label: "Works", to: "/#works", note: "Recent jobs" },
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
          {PAGES.map((p) => (
            <NavLink key={p.to} to={p.to} className={({ isActive }) => `nav__link ${isActive ? "is-active" : ""}`}>
              {p.label}
            </NavLink>
          ))}
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
          {[...PAGES, ...SECTIONS].map((item) => (
            <Link key={item.to} to={item.to} className="nav__drawer-link">
              <span>{item.label}</span>
              <span className="nav__drawer-note">{item.note}</span>
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
