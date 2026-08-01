import { useState } from "react";

import CanvasStage from "../components/CanvasStage.jsx";
import Figure from "../components/Figure.jsx";
import Reveal from "../components/Reveal.jsx";
import { Faq, ModuleHero, ModuleSwitch, OptionSet, SpecTable, TakeToQuote } from "../components/ModuleKit.jsx";
import { COMPANY, DAMAGE, FAQ, MODULES, MODULE_ORDER } from "../lib/site.js";

/* Turn the house so the affected slope faces the camera. */
function angleFor(fault) {
  const onBack = fault.hotspots[0]?.face === "back";
  return onBack ? Math.PI - 0.38 : -0.38;
}

export default function Repair() {
  const [faultId, setFaultId] = useState("leak");
  const fault = DAMAGE.find((d) => d.id === faultId) ?? DAMAGE[0];

  const summary = [
    ["Reported fault", fault.label],
    ["Fault code", fault.code],
    ["Response target", fault.urgency],
    ["Typical range", `$${fault.range[0]} – $${fault.range[1]}`],
  ];

  return (
    <>
      <ModuleHero module={MODULES.repair}>
        <div className="btn-row mhero__actions">
          <a className="btn btn--solid btn--lg" href={`tel:${COMPANY.phone.replace(/[^\d+]/g, "")}`}>
            Emergency? Call {COMPANY.phone}
          </a>
          <span className="anno--dim mhero__note">Same-day dry-in for active leaks</span>
        </div>
      </ModuleHero>

      <section className="config" aria-labelledby="fault-title">
        <div className="shell shell--wide config__grid">
          <div className="config__stage-col">
            <CanvasStage
              className="config__stage"
              tagLeft={`${fault.code} · ${fault.label}`}
              tagRight={`${fault.hotspots.length} location${fault.hotspots.length > 1 ? "s" : ""}`}
              fallbackNote={`${fault.label} — typical locations`}
              interactive
              environment
              pitch={1}
              hipInset={0}
              textureKind="tiles"
              roughness={0.8}
              metalness={0}
              tone={0.5}
              targetAngle={angleFor(fault)}
              hotspots={fault.hotspots}
              markerLabel={fault.code}
            />
            <p className="config__hint anno--dim">Markers show where this fault normally originates</p>
          </div>

          <div className="config__panel">
            <h2 id="fault-title" className="config__title">
              What are you seeing?
            </h2>

            <OptionSet legend="Reported fault" name="fault" options={DAMAGE} value={faultId} onChange={setFaultId} />

            <div className="fault" key={fault.id}>
              <p className="fault__symptom">{fault.symptom}</p>

              <SpecTable
                rows={[
                  ["Fault code", fault.code],
                  ["Response", fault.urgency],
                  [
                    "Typical cost",
                    <>
                      $<Figure value={fault.range[0]} /> – $<Figure value={fault.range[1]} />
                    </>,
                  ],
                ]}
              />

              <div className="fault__block">
                <p className="anno--dim fault__block-head">How we fix it</p>
                <p className="prose">{fault.scope}</p>
              </div>

              <div className="fault__block">
                <p className="anno--dim fault__block-head">Tell-tale signs</p>
                <ul className="fault__signs">
                  {fault.signs.map((sign) => (
                    <li key={sign}>{sign}</li>
                  ))}
                </ul>
              </div>

              <p className="estimate__caveat">
                Ranges cover the ordinary version of each fault. We confirm on site before any work starts, and if it
                turns out you do not need us, we will say so.
              </p>

              <TakeToQuote module="repair" summary={summary} label="Book a free inspection" />
            </div>
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="honest-title">
        <div className="shell">
          <Reveal className="head">
            <h2 id="honest-title">Most roofs sent to us for replacement did not need replacing.</h2>
            <p>
              Roofing has a reputation, and it was earned. Here is the part of the pitch other firms leave out: a roof
              that is twenty years old and leaking in one spot usually has a twenty-year-old flashing problem, not a
              twenty-year-old roof problem.
            </p>
          </Reveal>

          <div className="compare">
            <Reveal className="compare__col" delay={0.05}>
              <h3 className="compare__head">We will quote a repair when</h3>
              <ul className="compare__list">
                <li>The covering has life left and the fault is local</li>
                <li>The deck underneath is dry and sound</li>
                <li>Matching material is still available</li>
                <li>The same fault has not been patched three times already</li>
              </ul>
            </Reveal>
            <Reveal className="compare__col" delay={0.12}>
              <h3 className="compare__head">We will tell you to replace when</h3>
              <ul className="compare__list">
                <li>The deck is saturated or delaminating</li>
                <li>Granule loss is general rather than in patches</li>
                <li>Repairs would exceed about 40% of a new roof</li>
                <li>Your insurer has already approved a full scope</li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <Faq items={FAQ.repair} />
      <ModuleSwitch current="repair" modules={MODULES} order={MODULE_ORDER} />
    </>
  );
}
