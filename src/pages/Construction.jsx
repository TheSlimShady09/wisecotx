import { useMemo, useState } from "react";

import CanvasStage from "../components/CanvasStage.jsx";
import Figure from "../components/Figure.jsx";
import Reveal from "../components/Reveal.jsx";
import { Faq, ModuleHero, ModuleSwitch, OptionSet, Process, SpecTable, TakeToQuote } from "../components/ModuleKit.jsx";
import { AREA, FAQ, FINISHES, MATERIALS, MODULES, MODULE_ORDER, ROOF_SHAPES, estimateBuild } from "../lib/site.js";

const BUILD_STEPS = [
  { step: "Survey", detail: "We measure the roof properly, check the structure can carry your chosen covering, and photograph what is already there." },
  { step: "Fixed quote", detail: "A written price with the deck-replacement rate stated up front, so nothing gets invented halfway through." },
  { step: "Strip & deck", detail: "Old covering off, skips on site, deck inspected board by board. You see photographs of anything we replace." },
  { step: "Dry-in", detail: "Underlayment and flashing before anything else goes on. This is the layer that actually keeps water out." },
  { step: "Covering & finish", detail: "Your chosen system laid, ridge bedded, edges detailed, site swept with a magnet for stray nails." },
  { step: "Sign-off", detail: "Walk the job with the crew lead, get the warranty registered with the manufacturer, keep the photo record." },
];

export default function Construction() {
  const [shapeId, setShapeId] = useState("gable");
  const [materialId, setMaterialId] = useState("shingles");
  const [finishId, setFinishId] = useState("matte");
  const [area, setArea] = useState(AREA.default);
  const [tearOff, setTearOff] = useState(true);

  const est = useMemo(
    () => estimateBuild({ shapeId, materialId, finishId, area, tearOff }),
    [shapeId, materialId, finishId, area, tearOff],
  );

  const { shape, material, finish } = est;

  const summary = [
    ["Roof shape", shape.label],
    ["Covering", material.label],
    ["Finish", finish.label],
    ["Roof area", `${area.toLocaleString("en-US")} ft²`],
    ["Tear-off", tearOff ? "Yes — strip existing" : "No — new structure"],
    ["Indicative range", `$${est.low.toLocaleString("en-US")} – $${est.high.toLocaleString("en-US")}`],
  ];

  return (
    <>
      <ModuleHero module={MODULES.construction} />

      <section className="config" aria-labelledby="config-title">
        <div className="shell shell--wide config__grid">
          <div className="config__stage-col">
            <CanvasStage
              className="config__stage"
              tagLeft={`${shape.label} · ${material.label}`}
              tagRight={shape.spec}
              fallbackNote={`${shape.label} roof — ${material.label}`}
              interactive
              complex
              pitch={shape.pitch}
              hipInset={shape.hipInset}
              textureKind={material.texture}
              roughness={finish.roughness}
              metalness={material.metalness}
              tone={material.tone}
              spin={0.05}
            />
            <p className="config__hint anno--dim">Drag to orbit · the roof morphs, it does not swap</p>
          </div>

          <div className="config__panel">
            <h2 id="config-title" className="config__title">
              Specify it.
            </h2>

            <OptionSet
              legend="Roof shape"
              name="shape"
              options={ROOF_SHAPES}
              value={shapeId}
              onChange={setShapeId}
            />
            <p className="config__desc prose">{shape.desc}</p>

            <OptionSet
              legend="Covering"
              name="material"
              options={MATERIALS}
              value={materialId}
              onChange={setMaterialId}
            />
            <p className="config__desc prose">{material.desc}</p>

            <OptionSet
              legend="Finish"
              name="finish"
              options={FINISHES}
              value={finishId}
              onChange={setFinishId}
              columns={3}
            />

            <div className="slider">
              <div className="slider__head">
                <label className="anno" htmlFor="area">
                  Roof area
                </label>
                <output className="slider__value mono-num" htmlFor="area">
                  {area.toLocaleString("en-US")} ft²
                </output>
              </div>
              <input
                id="area"
                type="range"
                min={AREA.min}
                max={AREA.max}
                step={AREA.step}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
              />
              <div className="slider__scale anno--dim">
                <span>{AREA.min.toLocaleString("en-US")}</span>
                <span>Home 1,500–3,000 · commercial 5,000+</span>
                <span>{AREA.max.toLocaleString("en-US")}</span>
              </div>
            </div>

            <label className="toggle">
              <input type="checkbox" checked={tearOff} onChange={(e) => setTearOff(e.target.checked)} />
              <span className="toggle__box" aria-hidden="true" />
              <span className="toggle__text">
                Strip the existing roof first
                <span className="toggle__note anno--dim">Uncheck for new-build or an extension</span>
              </span>
            </label>

            {/* ---- live estimate ---- */}
            <div className="estimate">
              <p className="estimate__label anno">Indicative range</p>
              <p className="estimate__figure">
                $<Figure value={est.low} /> <span className="estimate__dash">–</span> $<Figure value={est.high} />
              </p>
              <SpecTable
                className="estimate__spec"
                rows={[
                  ["Rate", <><Figure value={est.perSqft} format={(n) => n.toFixed(2)} /> per ft²</>],
                  ["Life expectancy", material.life],
                  ["Load", material.weight],
                  ["System", material.spec],
                ]}
              />
              <p className="estimate__caveat">
                A real range from current material and crew rates — not a placeholder. It lands within about 10% on a
                straightforward roof. Valleys, deck condition and access move it, which is what the site visit is for.
              </p>
              <div className="estimate__confirm" role="note">
                <span className="estimate__confirm-mark" aria-hidden="true">
                  !
                </span>
                <p>
                  Indicative only — a fixed price cannot be set until WCG has verified the roof on site. Every quote is
                  confirmed once before any work is booked.
                </p>
              </div>
              <TakeToQuote module="construction" summary={summary} label="Request an inspection for this spec" />
            </div>
          </div>
        </div>
      </section>

      <Process
        title="Six stages, and you see the photographs at every one."
        intro="No stage starts before you have signed off the one before it."
        steps={BUILD_STEPS}
      />

      <section className="band band--tight">
        <div className="shell">
          <Reveal className="pledge">
            <p className="pledge__text">
              If we open your roof and find the deck is sound, the quote goes <em>down</em>. We have never once found a
              reason for it to only ever go up.
            </p>
          </Reveal>
        </div>
      </section>

      <Faq items={FAQ.construction} />
      <ModuleSwitch current="construction" modules={MODULES} order={MODULE_ORDER} />
    </>
  );
}
