# Wise Co Group

Lead-generation site for a roofing company that builds, repairs and insures roofs.
Three modules, three audiences, one 3D house.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run check    # lint + geometry proofs + route render check
```

## Routes

| Route           | Module | Audience | What it does                                                       |
| --------------- | ------ | -------- | ------------------------------------------------------------------ |
| `/`             | —      | all      | Entry screen: "where do you need help?" + the rotating house       |
| `/construction` | M-01   | B2C      | Shape / covering / finish / area configurator with a live estimate |
| `/repair`       | M-02   | B2C      | Fault picker; markers pin to the damaged area of the roof          |
| `/insurance`    | M-03   | B2B      | Peril classes, inspection map, carrier process, capacity           |
| `/quote`        | —      | both     | Enquiry form; copy switches register for carriers vs homeowners    |

## The one-house idea

There is no `.glb`. The house is generated procedurally, and the roof is a
six-vertex parametric surface driven by two numbers:

- `height` — ridge height above the eave line
- `hipInset` — how far the ridge is pulled in from the ends

Gable, hip and flat are three points in that same space, which is why the
configurator can **morph** between shapes instead of swapping models. At
`hipInset = 0` the end faces are the gable walls; open the inset and the very
same triangles become hip slopes.

Roof coverings (clay tile / standing seam / architectural shingle) are drawn into
a canvas at runtime — grayscale by construction, no image downloads. A covering
change crossfades between two coincident meshes rather than popping.

`npm run check:geometry` proves the winding (every face normal points outward at
gable, hip, flat and an intermediate state) and that damage markers land exactly
on the slope plane.

## Performance

- three.js sits behind `React.lazy` and is only fetched when a stage nears the
  viewport. Initial JS is ~131 kB gzipped; the 3D chunk is a separate ~246 kB.
- The render loop parks itself (`frameloop="never"`) when the canvas scrolls
  off-screen or the tab is backgrounded.
- No WebGL, or the chunk still loading → a blueprint SVG elevation renders instead.

## Accessibility

- Keyboard-operable throughout; the entry cards respond to focus exactly as they
  do to hover, and the 3D reorients either way.
- `prefers-reduced-motion` stops the house rotating and drifting, drops the
  counters to instant, and degrades reveals to a crossfade.
- Colour roles are contrast-checked against `#0B0B0C`: `--ink` 16:1,
  `--ink-muted` 7.1:1, `--ink-dim` 5.4:1. `--ink-faint` is 3.0:1 and is reserved
  for hairlines and inert glyphs — never for readable text.

## Not wired up

`src/pages/Quote.jsx` validates and confirms, but the submit handler does not
post anywhere yet — drop your CRM or form endpoint in at the marked line. The
company details, credentials, projects and testimonials in `src/lib/site.js` are
placeholder content and need replacing with real figures before launch.
