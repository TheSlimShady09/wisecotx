/* Blueprint elevation used wherever the 3D cannot or should not run:
   no WebGL, and as the Suspense placeholder while the chunk loads. */
export default function StaticHouse({ note = "Elevation — WCG standard gable" }) {
  return (
    <div className="fallback">
      <div>
        <svg viewBox="0 0 400 300" role="img" aria-label="Line elevation of a gable roof house with a chimney">
          <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
            {/* roof */}
            <path d="M30 152 L200 62 L370 152" stroke="currentColor" strokeWidth="1.6" />
            <path d="M52 152 L200 74 L348 152" opacity="0.45" />
            {/* body */}
            <path d="M62 152 L62 252 L338 252 L338 152" stroke="currentColor" />
            {/* chimney */}
            <path d="M276 108 L276 60 L306 60 L306 124" stroke="currentColor" />
            <path d="M271 60 L311 60" strokeWidth="2" stroke="currentColor" />
            {/* openings */}
            <path d="M104 252 L104 196 L146 196 L146 252" />
            <path d="M178 178 L178 214 L222 214 L222 178 Z" />
            <path d="M254 178 L254 214 L298 214 L298 178 Z" />
            <path d="M200 178 L200 214 M178 196 L222 196" opacity="0.5" />
            <path d="M276 178 L276 214 M254 196 L298 196" opacity="0.5" />
            {/* ground */}
            <path d="M14 252 L386 252" stroke="currentColor" opacity="0.5" />
            <path d="M14 258 L26 252 M34 258 L46 252 M54 258 L66 252" opacity="0.3" />
            <path d="M334 258 L346 252 M354 258 L366 252 M374 258 L386 252" opacity="0.3" />
          </g>

          {/* dimension lines */}
          <g stroke="currentColor" strokeWidth="1" opacity="0.7">
            <path d="M30 276 L370 276" />
            <path d="M30 270 L30 282 M370 270 L370 282" />
            <path d="M14 62 L14 252" />
            <path d="M8 62 L20 62 M8 252 L20 252" />
          </g>
          <g fill="currentColor" fontFamily="'Space Mono', monospace" fontSize="10" letterSpacing="1.5">
            <text x="200" y="292" textAnchor="middle">
              SPAN
            </text>
            <text x="200" y="52" textAnchor="middle">
              RIDGE
            </text>
          </g>
        </svg>
        <p className="fallback__note">{note}</p>
      </div>
    </div>
  );
}
