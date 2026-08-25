import RoofSystemStage from "../components/RoofSystemStage.jsx";
import Reveal from "../components/Reveal.jsx";
import { Faq, ModuleHero, ModuleSwitch, Process, TakeToQuote } from "../components/ModuleKit.jsx";
import { FAQ, MODULES, MODULE_ORDER } from "../lib/site.js";

/* The Seal / Defend / Breathe idea behind a full roofing system. */
const SYSTEM_BENEFITS = [
  { title: "Seal", text: "Self-adhered ice & water shield at the eaves and valleys, plus synthetic underlayment across the whole deck, form a watertight second skin the shingles never have to fight alone." },
  { title: "Defend", text: "Starter, field, and hip & ridge shingles installed in the exact sequence the manufacturer engineered — wind-rated, nailed to spec, and warranty-ready." },
  { title: "Breathe", text: "Balanced intake and exhaust ventilation pulls heat and moisture out of the attic, so the deck stays dry and the shingles reach their full rated life in the Texas sun." },
];

const SYSTEM_LAYERS = [
  "Roof decking",
  "Ice & water shield",
  "Synthetic underlayment",
  "Starter shingles",
  "Architectural shingles",
  "Intake & exhaust ventilation",
];

const BUILD_STEPS = [
  { step: "Inspection", detail: "We get on the roof, document every slope with photos, and check the decking and structure. On storm or hail damage, we document it fully for your insurance claim." },
  { step: "Scope & quote", detail: "A written scope with the decking-replacement rate stated up front. On insurance work we meet your adjuster on-site and build the claim to match." },
  { step: "Tear-off & deck", detail: "The old roof stripped to the deck, a roll-off dumpster on site, every board inspected. You see photos of anything we replace." },
  { step: "Dry-in", detail: "Ice & water shield, synthetic underlayment, and new flashing before a single shingle goes down. This is the layer that actually keeps water out." },
  { step: "Shingles & detail", detail: "Your system installed to manufacturer spec — starter, field, ridge, every penetration flashed — then the whole yard swept with a magnet for stray nails." },
  { step: "Final walk & warranty", detail: "We walk the roof with you, register the manufacturer warranty, and hand over the full photo record. On claims, we close out directly with your carrier." },
];

export default function Construction() {
  return (
    <>
      <ModuleHero module={MODULES.construction}>
        <div className="btn-row mhero__actions">
          <TakeToQuote
            module="construction"
            summary={[["Enquiry", "New roof / full build"]]}
            label="Request a free inspection"
          />
          <span className="anno--dim mhero__note">Free on-site inspection · written quote</span>
        </div>
      </ModuleHero>

      <section className="band" aria-labelledby="system-title">
        <div className="shell shell--wide">
          <Reveal className="anno-rule">
            <span className="anno">The roofing system</span>
          </Reveal>
          <Reveal className="head">
            <h2 id="system-title">A roof isn't one layer. It's a system.</h2>
            <p>
              Drag the model to turn it, then click any layer to see the job it does. Skip one — or nail it wrong — and
              that's where a roof fails early. This is the full WCG system, from the deck to the ridge cap.
            </p>
          </Reveal>

          <div className="system">
            <div className="system__stage-col">
              <RoofSystemStage className="system__stage" />
              <p className="config__hint anno--dim">Drag to orbit · click a layer for details</p>
            </div>

            <div className="system__body">
              <ul className="system__benefits">
                {SYSTEM_BENEFITS.map((b, i) => (
                  <Reveal key={b.title} delay={i * 0.06} as="li" className="system__benefit">
                    <span className="system__benefit-title">{b.title}</span>
                    <span className="system__benefit-text">{b.text}</span>
                  </Reveal>
                ))}
              </ul>

              <Reveal delay={0.1}>
                <ol className="system__layers">
                  {SYSTEM_LAYERS.map((layer, i) => (
                    <li key={layer}>
                      <span className="system__layer-num mono-num">{String(i + 1).padStart(2, "0")}</span>
                      {layer}
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <Process
        title="Six stages — and you see the photos at every one."
        intro="Nothing moves to the next stage until you've signed off the last."
        steps={BUILD_STEPS}
      />

      <Faq items={FAQ.construction} />
      <ModuleSwitch current="construction" modules={MODULES} order={MODULE_ORDER} />
    </>
  );
}
