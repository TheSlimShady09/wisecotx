import { useState } from "react";

import CanvasStage from "../components/CanvasStage.jsx";
import Reveal from "../components/Reveal.jsx";
import { Faq, ModuleHero, ModuleSwitch, OptionSet, Process, SpecTable, TakeToQuote } from "../components/ModuleKit.jsx";
import { CARRIER_PROCESS, FAQ, MODULES, MODULE_ORDER, PERILS } from "../lib/site.js";

const CAPACITY = [
  ["Standing capacity", "40 roofs / month"],
  ["Storm surge capacity", "~120 roofs / month"],
  ["Acknowledgement", "< 4 business hours"],
  ["Inspection", "< 72 hours"],
  ["General liability", "$5,000,000"],
  ["Workers' compensation", "$2,000,000"],
  ["Estimating platform", "Xactimate"],
  ["Coverage area", "DFW metroplex"],
];

function angleFor(peril) {
  return peril.hotspots[0]?.face === "back" ? Math.PI - 0.38 : -0.38;
}

export default function Insurance() {
  const [perilId, setPerilId] = useState("hail");
  const peril = PERILS.find((p) => p.id === perilId) ?? PERILS[0];

  const summary = [
    ["Peril class", peril.label],
    ["Peril code", peril.code],
    ["Reporting window", peril.cycle],
    ["Enquiry type", "Carrier / adjuster / TPA"],
  ];

  return (
    <>
      <ModuleHero module={MODULES.insurance}>
        <div className="btn-row mhero__actions">
          <TakeToQuote
            module="insurance"
            summary={[["Enquiry type", "Carrier / adjuster / TPA"]]}
            label="Open a subcontractor account"
          />
          <span className="anno--dim mhero__note">Sample scopes and COIs available on request</span>
        </div>
      </ModuleHero>

      <section className="config" aria-labelledby="peril-title">
        <div className="shell shell--wide config__grid">
          <div className="config__stage-col">
            <CanvasStage
              className="config__stage"
              tagLeft={`${peril.code} · ${peril.label}`}
              tagRight="Inspection map"
              fallbackNote={`${peril.label} — typical inspection points`}
              interactive
              prop="magnifier"
              pitch={1}
              hipInset={0.42}
              textureKind="shingles"
              roughness={0.9}
              metalness={0}
              tone={0.58}
              targetAngle={angleFor(peril)}
              hotspots={peril.hotspots}
              markerLabel={peril.code}
            />
            <p className="config__hint anno--dim">Markers show where our inspectors document this peril class</p>
          </div>

          <div className="config__panel">
            <h2 id="peril-title" className="config__title">
              Peril classes we scope.
            </h2>
            <p className="config__desc prose">
              Select a class to see what lands in the file. Every scope is photographed to the same standard whether the
              outcome is a full replacement or a decline.
            </p>

            <OptionSet legend="Peril class" name="peril" options={PERILS} value={perilId} onChange={setPerilId} />

            <div className="fault" key={peril.id}>
              <SpecTable
                rows={[
                  ["Peril code", peril.code],
                  ["Reporting window", peril.cycle],
                ]}
              />

              <div className="fault__block">
                <p className="anno--dim fault__block-head">Our method</p>
                <p className="prose">{peril.summary}</p>
              </div>

              <div className="fault__block">
                <p className="anno--dim fault__block-head">Returned in the file</p>
                <ul className="fault__signs">
                  {peril.deliverables.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <TakeToQuote module="insurance" summary={summary} label="Request a scope sample" />
            </div>
          </div>
        </div>
      </section>

      <Process
        title="Assignment to close-out, without the chasing."
        intro="The whole point of a subcontractor is that the file moves without you managing it. These are the commitments we hold ourselves to."
        steps={CARRIER_PROCESS}
      />

      <section className="band sheet--flip" aria-labelledby="capacity-title">
        <div className="shell">
          <Reveal className="head">
            <h2 id="capacity-title">Capacity, cover and cycle times.</h2>
            <p>
              The numbers you need for a vendor file. Certificates, W-9 and sample scopes go out the same day you ask
              for them.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <SpecTable className="spec--split" rows={CAPACITY} />
          </Reveal>
        </div>
      </section>

      <section className="band band--tight">
        <div className="shell">
          <Reveal className="pledge">
            <p className="pledge__text">
              We report cosmetic damage as cosmetic. A subcontractor who finds a total loss on every assignment is not
              an asset to your loss ratio, and eventually not an asset to your file.
            </p>
          </Reveal>
        </div>
      </section>

      <Faq items={FAQ.insurance} title="Vendor questions" />
      <ModuleSwitch current="insurance" modules={MODULES} order={MODULE_ORDER} />
    </>
  );
}
