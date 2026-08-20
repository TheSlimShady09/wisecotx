/* Single source of truth for the roofing-system layers: the visual
   properties the 3D scene needs, plus the copy the info card shows
   when a layer is clicked. Kept in a plain module so the info panel
   can read it without pulling in the three.js bundle. */

export const ROOF_LAYERS = [
  {
    id: "deck",
    label: "Roof decking",
    role: "The structural base",
    desc: "OSB or plywood sheathing fixed to the rafters. Everything above bonds to it, so we inspect every board and replace anything soft or rotten before a single nail goes back in.",
    // visual
    i: 0, t: 0.1, color: 0.32, rough: 0.95, side: -1,
  },
  {
    id: "icewater",
    label: "Ice & water shield",
    role: "Self-adhered waterproofing",
    desc: "A peel-and-stick membrane at the eaves, valleys and penetrations. It self-seals around nails and stops wind-driven rain and ice dams from ever reaching the deck.",
    i: 1, t: 0.04, color: 0.15, rough: 0.55, metal: 0.1, side: -1,
  },
  {
    id: "underlay",
    label: "Synthetic underlayment",
    role: "The secondary water shield",
    desc: "A tear-resistant synthetic sheet over the whole deck — lighter, stronger and far more stable than old felt. It is the layer that keeps water out while the roof is being built.",
    i: 2, t: 0.035, color: 0.5, rough: 0.85, side: -1,
  },
  {
    id: "starter",
    label: "Starter shingles",
    role: "The sealed first course",
    desc: "A dedicated strip along the eaves and rakes with a factory adhesive line. It locks down the first row of shingles and is the difference between a roof that holds in a storm and one that peels.",
    i: 3, t: 0.06, color: 0.36, rough: 0.9, tex: "shingles", side: -1,
  },
  {
    id: "field",
    label: "Architectural shingles",
    role: "The weather surface",
    desc: "The layer you see — dimensional, laminate shingles that are wind-rated and warrantied by the manufacturer. Laid in the engineered pattern, they shed decades of Texas sun, hail and rain.",
    i: 4, t: 0.08, color: 0.44, rough: 0.9, tex: "shingles", side: -1,
  },
  {
    id: "ridge",
    label: "Hip & ridge shingles",
    role: "The capped peak",
    desc: "Pre-formed caps that bend over the hips and ridge, sealing the highest, most exposed joints and finishing the roofline. They also cap the exhaust ventilation running along the ridge.",
    i: 5, t: 0.09, color: 0.4, rough: 0.9, tex: "shingles", side: -1, ridgeOnly: true,
  },
];

export const ROOF_LAYERS_BY_ID = Object.fromEntries(ROOF_LAYERS.map((l) => [l.id, l]));
