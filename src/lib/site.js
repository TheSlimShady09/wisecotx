/* ============================================================
   Single source of truth for module copy, configurator options
   and the estimate model. Keeps pages declarative.
   ============================================================ */

export const COMPANY = {
  name: "WCG",
  short: "WCG",
  fullName: "WCG",
  tagline: "Roofing & Construction",
  phone: "214-500-7360",
  email: "vini@wisecogroup.com",
  address: {
    line1: "5810 Long Prairie Rd, Suite 700-367",
    city: "Flower Mound, TX 75028",
  },
  region: "DFW Metroplex",
  hours: "Mon–Sat, 7:00–19:00",
  license: "Serving Dallas–Fort Worth, TX",
  social: {
    facebook: "https://www.facebook.com/wisecg",
    instagram: "https://www.instagram.com/wisecotx/",
    youtube: "https://www.youtube.com/@wisecontx",
  },
};

/* ---------- house geometry constants (shared by 3D + fallback) ---------- */
export const HOUSE = {
  halfWidth: 2.25,
  halfDepth: 1.6,
  wallHeight: 1.45,
  eave: 0.22,
};

/* ---------- the three modules ---------- */
export const MODULES = {
  construction: {
    id: "construction",
    code: "M-01",
    label: "Construction",
    audience: "b2c",
    title: "A new roof, drawn before it is built.",
    tagline: "New roofs, built from the deck up.",
    blurb:
      "Full tear-off and new build. Structure, decking, underlayment, flashing and finish — installed by our own crews, not brokered out.",
    hoverLine: "You are building new, replacing an old roof, or roofing an extension.",
    /* the angle the house turns to when this card is focused (radians) */
    viewAngle: -0.55,
    roofTone: 0.82,
    cta: "Configure your roof",
  },
  repair: {
    id: "repair",
    code: "M-02",
    label: "Repair",
    audience: "b2c",
    title: "Find the damage. Price the fix.",
    tagline: "Leaks, storm damage, missing tiles.",
    blurb:
      "Most roofs do not need replacing. Tell us what you are seeing and we will scope the smallest repair that actually holds.",
    hoverLine: "Something is leaking, broken or torn loose and you need it stopped.",
    viewAngle: 0.0,
    roofTone: 0.55,
    cta: "Locate the damage",
  },
  insurance: {
    id: "insurance",
    code: "M-03",
    label: "Insurance",
    audience: "b2b",
    title: "Roofing scope you can underwrite.",
    tagline: "Subcontracted claim work for carriers.",
    blurb:
      "We work as a roofing subcontractor for insurance carriers and adjusters: inspection, documented scope, Xactimate-aligned pricing, and completion within cycle-time targets.",
    hoverLine: "You are a carrier, adjuster or TPA placing roofing claim work.",
    viewAngle: 0.62,
    roofTone: 1.0,
    cta: "Review the process",
  },
};

export const MODULE_ORDER = ["construction", "repair", "insurance"];

/* ============================================================
   The full service catalogue — what WCG actually offers, as a
   turn-key roofing and restoration general contractor for the
   DFW Metroplex. Rendered as a Services overview.
   ============================================================ */
export const SERVICE_CATEGORIES = [
  {
    code: "S-01",
    label: "Residential Roofing",
    blurb: "Roof replacement and long-term maintenance for homes, in every common covering.",
    services: [
      "Residential roof replacement",
      "Asphalt shingles",
      "Metal & composite",
      "Ceramic tile",
      "Roof maintenance plan",
    ],
  },
  {
    code: "S-02",
    label: "Commercial Roofing",
    blurb: "Low-slope and metal systems for commercial buildings, sized to the span and the use.",
    services: [
      "Commercial roof replacement",
      "Single-ply roof systems",
      "Modified bitumen",
      "Sheet metal work",
      "Roof maintenance plan",
    ],
  },
  {
    code: "S-03",
    label: "Exterior Restoration",
    blurb: "Turn-key exterior work that puts the building envelope back together after a loss.",
    services: [
      "Turn-key general contractor for exterior restoration",
      "Masonry & siding replacement",
      "Fascia & soffit replacement",
      "Gutters & downspout replacement",
    ],
  },
  {
    code: "S-04",
    label: "Interior Restoration",
    blurb: "The inside put right too — from structure and systems through to the final finishes.",
    services: [
      "Turn-key general contractor for interior restoration",
      "Drywall, painting & finishes",
      "Countertops & cabinets",
      "Electrical, mechanical & plumbing",
    ],
  },
];

/* ============================================================
   Landing preview sections — the same house, dressed for each
   module. This is where "one house, three roles" is actually
   demonstrated rather than described: a clean new metal roof,
   a damaged tiled one, and a hipped roof under inspection.
   ============================================================ */
export const MODULE_PREVIEW = {
  construction: {
    heading: "Specify the roof before anyone climbs a ladder.",
    lead: "Pick the shape, the covering and the finish. The model rebuilds as you choose, and the price moves with it.",
    highlights: [
      "Roof shapes, coverings and finishes — priced live",
      "Written quote with the deck rate stated up front",
      "Our own crews — nothing brokered out",
    ],
    cta: "Open the configurator",
    scene: {
      pitch: 1,
      hipInset: 0,
      textureKind: "metal",
      roughness: 0.32,
      metalness: 0.85,
      tone: 0.88,
      spin: 0.3,
      // a big, finished two-storey build with a garage wing, a left wing
      // and a rear ell — four separate roofs in all
      complex: true,
      modelScale: 1.12,
    },
  },
  repair: {
    heading: "Show us where it hurts.",
    lead: "Pick what you are seeing and the model marks where that fault normally starts. Most of them are cheaper than you fear.",
    highlights: [
      "Same-day dry-in for active leaks",
      "We quote the repair, not the replacement, when a repair will hold",
      "Documented to the standard insurers expect",
    ],
    cta: "Locate the damage",
    scene: {
      pitch: 1,
      hipInset: 0,
      textureKind: "tiles",
      roughness: 0.8,
      metalness: 0,
      tone: 0.5,
      hotspotsFrom: { set: "damage", id: "wind" },
      spin: 0.3,
    },
  },
  insurance: {
    heading: "Scope you can put straight into the file.",
    lead: "Test squares, impact counts and matched photography on every slope — with a repair-versus-replace opinion we will stand behind.",
    highlights: [
      "Inspection inside 72 hours, report in 3–5 days",
      "Xactimate-aligned, supplements itemised separately",
      "$5M general liability, fully bonded",
    ],
    cta: "Review the process",
    scene: {
      pitch: 1,
      hipInset: 0.42,
      textureKind: "shingles",
      roughness: 0.9,
      metalness: 0,
      tone: 0.58,
      hotspotsFrom: { set: "perils", id: "hail" },
      spin: 0.3,
    },
  },
};

/* ============================================================
   CONSTRUCTION configurator
   Roof shapes live on one continuous parameter space so the 3D
   can morph between them instead of swapping models.
   pitch    -> ridge height multiplier
   hipInset -> how far the ridge is pulled in from the gable ends
   ============================================================ */
export const ROOF_SHAPES = [
  {
    id: "gable",
    label: "Gable",
    note: "Two slopes, open ends",
    pitch: 1,
    hipInset: 0,
    multiplier: 1,
    spec: "8:12 pitch · ridge full span",
    desc: "The workhorse. Cheapest to frame, sheds water fast, gives you attic volume. Weakest against high lateral wind.",
  },
  {
    id: "hip",
    label: "Hip",
    note: "Four slopes, closed ends",
    pitch: 1,
    hipInset: 0.42,
    multiplier: 1.19,
    spec: "8:12 pitch · ridge inset 42%",
    desc: "Slopes on all four sides. Noticeably better in wind and often rated for it, but more cuts, more hips, more labour.",
  },
];

export const MATERIALS = [
  {
    id: "tiles",
    label: "Clay tile",
    rate: 15.5,
    life: "50+ yrs",
    weight: "Heavy",
    spec: "Interlocking · battened",
    desc: "Heaviest option and the longest lived. Needs framing that can carry it, so we check the structure before quoting.",
    texture: "tiles",
    roughness: 0.78,
    metalness: 0.0,
    tone: 0.62,
  },
  {
    id: "metal",
    label: "Standing seam",
    rate: 13.0,
    life: "40–60 yrs",
    weight: "Light",
    spec: "24ga · concealed fastener",
    desc: "Light, fast to install, sheds snow. Concealed fasteners mean there are no exposed screws to back out in ten years.",
    texture: "metal",
    roughness: 0.28,
    metalness: 0.85,
    tone: 0.88,
  },
  {
    id: "shingles",
    label: "Architectural shingle",
    rate: 8.25,
    life: "25–30 yrs",
    weight: "Medium",
    spec: "Laminated · 130mph rated",
    desc: "The default for a reason: lowest cost per square foot, wide colour range, and any crew in the country can service it later.",
    texture: "shingles",
    roughness: 0.92,
    metalness: 0.0,
    tone: 0.44,
  },
];

export const FINISHES = [
  { id: "matte", label: "Matte", roughness: 0.95, multiplier: 1, spec: "No sheen" },
  { id: "satin", label: "Satin", roughness: 0.5, multiplier: 1.05, spec: "Low sheen" },
  { id: "gloss", label: "Gloss", roughness: 0.16, multiplier: 1.11, spec: "High sheen" },
];

export const AREA = { min: 1000, max: 20000, step: 100, default: 2000 };

/* Fixed costs that do not scale with area, plus the range we show. */
const MOBILISATION = 2400;
const TEAROFF_RATE = 1.85;

export function estimateBuild({ shapeId, materialId, finishId, area, tearOff }) {
  const shape = ROOF_SHAPES.find((s) => s.id === shapeId) ?? ROOF_SHAPES[0];
  const material = MATERIALS.find((m) => m.id === materialId) ?? MATERIALS[0];
  const finish = FINISHES.find((f) => f.id === finishId) ?? FINISHES[0];

  const perSqft = material.rate * shape.multiplier * finish.multiplier;
  const covering = perSqft * area;
  const strip = tearOff ? TEAROFF_RATE * area : 0;
  const mid = covering + strip + MOBILISATION;

  return {
    perSqft,
    low: Math.round((mid * 0.9) / 50) * 50,
    high: Math.round((mid * 1.12) / 50) * 50,
    shape,
    material,
    finish,
  };
}

/* ============================================================
   REPAIR configurator
   Each fault maps to a hotspot on the roof, in normalised
   roof-local coordinates: u across the ridge (-1..1),
   v up the slope (0 = eave, 1 = ridge), face = front|back|end.
   ============================================================ */
export const DAMAGE = [
  {
    id: "leak",
    label: "Active leak",
    code: "F-01",
    urgency: "Same week",
    note: "Same week · from $450",
    range: [450, 1800],
    hotspots: [{ u: -0.22, v: 0.62, face: "front", kind: "stain" }],
    symptom: "A stain on the ceiling, a drip in the attic, or damp along a chimney.",
    scope:
      "Nine times out of ten this is flashing, not the covering. We trace it back from the stain, open only the affected section, replace the flashing and underlayment, and re-lay the covering over it.",
    signs: ["Ceiling stains that grow after rain", "Damp insulation", "Rusted nail heads in the attic"],
  },
  {
    id: "tiles",
    label: "Broken / missing tiles",
    code: "F-02",
    urgency: "2–3 weeks",
    note: "2–3 weeks · from $280",
    range: [280, 950],
    hotspots: [
      { u: 0.34, v: 0.4, face: "front", kind: "gap" },
      { u: 0.52, v: 0.68, face: "front", kind: "gap" },
    ],
    symptom: "Visible gaps, slipped tiles, or fragments in the gutter.",
    scope:
      "We lift the courses above, replace the broken units and any cracked batten underneath, and re-bed the ridge if it has moved. Matching stock is sourced before we book the day.",
    signs: ["Daylight visible in the attic", "Tile fragments at the downspout", "Slipped or lifted courses"],
  },
  {
    id: "wind",
    label: "Wind / storm damage",
    code: "F-03",
    urgency: "Emergency",
    note: "Same-day dry-in · from $900",
    range: [900, 4200],
    hotspots: [
      { u: -0.72, v: 0.82, face: "front", kind: "tear" },
      { u: -0.55, v: 0.5, face: "front", kind: "tear" },
      { u: -0.8, v: 0.35, face: "back", kind: "tear" },
    ],
    symptom: "A section stripped, ridge lifted, or edge trim peeled back after a storm.",
    scope:
      "Emergency dry-in first — we get a membrane over the opening the same day. Then a documented scope with photographs, which is what your insurer will want if you are claiming.",
    signs: ["Missing sections after a storm", "Lifted ridge or hip caps", "Torn edge flashing"],
  },
  {
    id: "gutter",
    label: "Gutter & edge",
    code: "F-04",
    urgency: "4 weeks",
    note: "4 weeks · from $220",
    range: [220, 1100],
    hotspots: [
      { u: 0.0, v: 0.04, face: "front", kind: "streak" },
      { u: 0.6, v: 0.04, face: "front", kind: "streak" },
    ],
    symptom: "Water running behind the gutter, or rot in the fascia board.",
    scope:
      "Re-hang or replace the run, fit new drip edge so water cannot track behind it, and cut out any fascia that has gone soft. Cheap now, expensive if left.",
    signs: ["Water sheeting behind the gutter", "Soft or stained fascia", "Standing water in the run"],
  },
];

/* ============================================================
   INSURANCE — B2B. No consumer price; a scope readout instead.
   ============================================================ */
export const PERILS = [
  {
    id: "hail",
    label: "Hail",
    code: "P-01",
    hotspots: [
      { u: -0.4, v: 0.55, face: "front" },
      { u: 0.1, v: 0.72, face: "front" },
      { u: 0.55, v: 0.38, face: "front" },
      { u: -0.2, v: 0.45, face: "back" },
    ],
    cycle: "3–5 days to report",
    note: "Report in 3–5 days",
    summary:
      "Test squares on each slope, impact counts per 10ft × 10ft, and matched photographs of soft metals. We report whether the bruising is functional damage or cosmetic, and we say so plainly either way.",
    deliverables: ["Test-square photo set", "Impact density per slope", "Soft-metal corroboration", "Repair vs replace opinion"],
  },
  {
    id: "wind",
    label: "Wind",
    code: "P-02",
    hotspots: [
      { u: -0.75, v: 0.8, face: "front" },
      { u: -0.6, v: 0.55, face: "front" },
      { u: 0.7, v: 0.85, face: "back" },
    ],
    cycle: "2–4 days to report",
    note: "Report in 2–4 days",
    summary:
      "Creased-tab counts by slope and elevation, seal-strip integrity checks, and edge-metal condition. Directional evidence is mapped against the reported event so causation is defensible.",
    deliverables: ["Creased-tab map", "Seal-strip test results", "Directional loss diagram", "Event-date correlation"],
  },
  {
    id: "water",
    label: "Water ingress",
    code: "P-03",
    hotspots: [
      { u: -0.15, v: 0.6, face: "front" },
      { u: -0.15, v: 0.2, face: "front" },
    ],
    cycle: "24h emergency dry-in",
    note: "24h emergency dry-in",
    summary:
      "Source tracing from the interior stain back to the penetration, moisture readings on decking and insulation, and same-day temporary dry-in to stop the loss growing while the claim is open.",
    deliverables: ["Moisture-meter readings", "Source trace photo sequence", "Dry-in completion record", "Mitigation invoice"],
  },
  {
    id: "structural",
    label: "Structural / impact",
    code: "P-04",
    hotspots: [
      { u: 0.3, v: 0.7, face: "front" },
      { u: 0.3, v: 0.4, face: "front" },
    ],
    cycle: "5–7 days with engineer",
    note: "5–7 days, engineer led",
    summary:
      "Fallen limb, vehicle or debris impact. We document deck and rafter condition, and where load path is in question we bring in a licensed structural engineer rather than guessing at it.",
    deliverables: ["Deck & rafter condition report", "Engineer referral where required", "Temporary shoring record", "Full replacement scope"],
  },
];

export const CARRIER_PROCESS = [
  {
    step: "Assignment",
    detail: "Claim lands through your portal, email or a direct feed. We acknowledge inside 4 business hours and name the crew lead.",
  },
  {
    step: "Inspection",
    detail: "On-site within 72 hours. Photographs are timestamped and geotagged, test squares are marked, and the report follows your template.",
  },
  {
    step: "Scope & estimate",
    detail: "Xactimate-aligned line items with our own supplements clearly separated, so the desk adjuster can approve without a second call.",
  },
  {
    step: "Execution",
    detail: "Materials ordered on approval, homeowner scheduled directly by us, and progress photographs pushed back to the file as we go.",
  },
  {
    step: "Close-out",
    detail: "Completion certificate, final photo set, lien waiver and warranty registration returned as one packet. No chasing.",
  },
];

/* ---------- trust ---------- */
export const CREDENTIALS = [
  { value: "18", unit: "yrs", label: "Trading since 2008" },
  { value: "2,400+", unit: "", label: "Roofs completed" },
  { value: "$5M", unit: "", label: "General liability cover" },
  { value: "4.9", unit: "/5", label: "Across 380 reviews" },
];

export const ACCREDITATIONS = [
  "State licensed GC #4471-RF",
  "Fully insured & bonded",
  "OSHA 30 certified crews",
  "GAF Master Elite contractor",
  "Xactimate certified estimators",
  "Manufacturer-backed warranties",
];

export const PROJECTS = [
  { ref: "PRJ-0412", title: "Gable rebuild, Ashcombe Row", spec: "Clay tile · 214 sq ft · 9 days", module: "construction" },
  { ref: "PRJ-0388", title: "Hail claim, Verity Heights", spec: "Full replacement · carrier scope", module: "insurance" },
  { ref: "PRJ-0361", title: "Storm strip-off, Bell Lane", spec: "Emergency dry-in · 6 hrs", module: "repair" },
  { ref: "PRJ-0344", title: "Standing seam, Northgate Mews", spec: "24ga metal · 168 sq ft", module: "construction" },
  { ref: "PRJ-0329", title: "Flat deck renewal, Carter Yard", spec: "Membrane · 240 sq ft", module: "construction" },
  { ref: "PRJ-0301", title: "Wind loss, Fairmount Drive", spec: "Adjuster-approved · 11 days", module: "insurance" },
];

/* ============================================================
   Works gallery — photos and short videos from real jobs.
   Drop files into public/works/ and set `src` (and `poster` for
   videos). While `src` is empty, a blueprint placeholder shows,
   so the grid is presentable before the media arrives.
   ============================================================ */
export const WORKS = [
  { id: "w1", title: "Roof of the week — Decatur, TX", spec: "50 square · full build + upgrade", type: "video", src: "/works/roof-of-the-week.mp4" },
  { id: "w2", title: "WCG Roofing — DFW", spec: "GAF system", type: "video", src: "/works/wcg-roofing.mp4" },
  { id: "w3", title: "Completed roof", spec: "Residential re-roof", type: "image", src: "/works/shot-1.png" },
  { id: "w4", title: "Kick-off in Plano, TX", spec: "New week, new roof", type: "video", src: "/works/plano-monday.mp4" },
  { id: "w5", title: "On-site sequence", spec: "Install", type: "video", src: "/works/sequence-01.mp4" },
  { id: "w6", title: "Finished detail", spec: "Residential", type: "image", src: "/works/shot-2.png" },
  { id: "w7", title: "Roofing in Decatur, TX", spec: "On site", type: "video", src: "/works/decatur-tx.mp4" },
];

export const TESTIMONIALS = [
  {
    quote:
      "They found the leak in twenty minutes after two other firms told us the whole roof had to come off. It was a flashing detail. Cost us four hundred dollars.",
    name: "Marianne D.",
    role: "Homeowner, Ashcombe",
    module: "repair",
  },
  {
    quote:
      "The estimate we saw online was within about six percent of the final invoice, and nothing was added quietly along the way. That is rarer than it should be.",
    name: "Tobias R.",
    role: "Homeowner, Northgate",
    module: "construction",
  },
  {
    quote:
      "Their scopes come in clean. Photographs are labelled, supplements are separated out, and the cycle time holds. We route storm volume to them first.",
    name: "Claims Operations",
    role: "Regional carrier, name withheld",
    module: "insurance",
  },
];

export const FAQ = {
  construction: [
    {
      q: "How accurate is the estimate from the configurator?",
      a: "It is a genuine range, not a teaser. It is built from our current material rates and crew day-rates, and it lands within about 10% of the final figure on a straightforward roof. Complex valleys, poor deck condition or access problems move it, which is exactly what the site visit is for.",
    },
    {
      q: "How long does a full roof take?",
      a: "A typical detached house is 5 to 9 working days from strip to clean-up. Tile runs longer than shingle. We do not start a roof we cannot finish before the next weather window.",
    },
    {
      q: "What happens if you open the roof and the deck is rotten?",
      a: "We stop, photograph it, and call you before we replace a single board. Deck replacement is priced per sheet at a rate we give you up front, so there is no invented number at the end.",
    },
  ],
  repair: [
    {
      q: "Can you come out in an emergency?",
      a: "Yes. Storm damage and active leaks get a same-day temporary dry-in where we can safely get on the roof. That stops the loss growing while we scope the permanent fix.",
    },
    {
      q: "Will you tell me if I actually need a full replacement?",
      a: "We will tell you either way. Most roofs sent to us for replacement need a repair instead, and we would rather have the repair and the referral than oversell you once.",
    },
    {
      q: "Do you handle the insurance paperwork?",
      a: "We document everything to the standard carriers expect — timestamped photographs, moisture readings, a written scope — and we deal with your adjuster directly if you want us to.",
    },
  ],
  insurance: [
    {
      q: "Which estimating platform do you work in?",
      a: "Xactimate, with our supplements itemised separately from the base scope so desk review is fast. We can export to your template on request.",
    },
    {
      q: "What are your cycle times?",
      a: "Acknowledgement inside 4 business hours, inspection within 72 hours, and report filed within 2 to 5 days depending on peril. Emergency mitigation is same-day.",
    },
    {
      q: "What is your coverage and capacity?",
      a: "$5M general liability, $2M workers' compensation, fully bonded. Standing capacity is 40 roofs per month, scaling to roughly 120 during a declared storm event with our partner crews.",
    },
  ],
};
