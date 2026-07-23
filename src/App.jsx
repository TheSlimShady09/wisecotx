import { useCallback, useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import EntryGate from "./components/EntryGate.jsx";
import { hasEnteredBefore } from "./lib/entry.js";
import Landing from "./pages/Landing.jsx";
import Construction from "./pages/Construction.jsx";
import Repair from "./pages/Repair.jsx";
import Insurance from "./pages/Insurance.jsx";
import Quote from "./pages/Quote.jsx";
import { COMPANY, MODULES, MODULE_ORDER } from "./lib/site.js";

const TITLES = {
  "/": `${COMPANY.fullName} (${COMPANY.name}) — Roofing & Restoration, ${COMPANY.region}`,
  "/construction": `New roofs — ${COMPANY.name}`,
  "/repair": `Roof repair — ${COMPANY.name}`,
  "/insurance": `Insurance subcontracting — ${COMPANY.name}`,
  "/quote": `Request an inspection — ${COMPANY.name}`,
};

function useRouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = TITLES[pathname] ?? COMPANY.name;
  }, [pathname]);
}

function NotFound() {
  return (
    <section className="band band--tall">
      <div className="shell">
        <span className="anno--dim">404</span>
        <h1 className="quote__title">That page is not on the drawing.</h1>
        <p className="lede">Nothing here. The three routes below are the whole site.</p>
        <div className="btn-row notfound__actions">
          {MODULE_ORDER.map((id) => (
            <Link key={id} to={`/${id}`} className="btn">
              {MODULES[id].label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const location = useLocation();
  const reduced = useReducedMotion();
  useRouteEffects();

  /* The gate is the front door: arrive anywhere on the site root and you
     pick one of the three before anything else. Evaluated once, so it
     never re-opens mid-session. */
  const [gateOpen, setGateOpen] = useState(() => location.pathname === "/" && !hasEnteredBefore());

  /* A choice at the gate lands you on that module's section, not on its
     page — the section previews it in 3D and the page is one click on.
     The double rAF is needed because the shell is display:none until the
     first frame after this: you cannot scroll to an element that has no
     box yet. */
  const handleChoose = useCallback(
    (moduleId) => {
      setGateOpen(false);
      if (!moduleId) return;

      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          document.getElementById(moduleId)?.scrollIntoView({
            behavior: reduced ? "auto" : "smooth",
            block: "start",
          });
        }),
      );
    },
    [reduced],
  );

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <AnimatePresence>
        {gateOpen ? <EntryGate key="gate" onChoose={handleChoose} /> : null}
      </AnimatePresence>

      {/* `inert`, never display:none. Hiding this subtree breaks every
          IntersectionObserver inside it — an element with no box never
          reports as intersecting, so the lazy 3D never mounts and the
          scroll reveals never fire, and the sections below arrive blank.
          inert removes it from focus and the a11y tree while leaving the
          layout intact. Nothing extra boots behind the gate anyway: the
          hero is a static drawing and the module stages are below the
          fold, so their observers correctly stay quiet. */}
      <div className="app-shell" inert={gateOpen} aria-hidden={gateOpen || undefined}>
        <Nav />

        <main id="main">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.12 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Routes location={location}>
                <Route path="/" element={<Landing />} />
                <Route path="/construction" element={<Construction />} />
                <Route path="/repair" element={<Repair />} />
                <Route path="/insurance" element={<Insurance />} />
                <Route path="/quote" element={<Quote />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </>
  );
}
