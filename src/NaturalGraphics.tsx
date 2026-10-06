// Abstract frond, leaf-vein, and drainage-inspired geometry.
// Not a botanical specimen or a claim about project implementation topology.
// All artwork is static SVG; the transition borrows the existing reveal hook.
const frondLeaflets = [
  [128, 287, -35, 1.0], [166, 263, -37, 0.95], [205, 233, -40, 0.9],
  [242, 203, -42, 0.82], [278, 165, -47, 0.73], [313, 123, -51, 0.62],
  [344, 82, -55, 0.48],
] as const;

export function BotanicalDrawing({ className = "" }: { className?: string }) {
  return (
    <svg className={`botanical-drawing ${className}`} viewBox="0 0 560 350"
      fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M67 322C166 286 252 205 313 123C352 70 374 37 390 18" className="frond-spine" />
        {frondLeaflets.map(([x, y, angle, scale]) => (
          <g key={x} transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
            <path d="M0 0C-18-41-62-53-91-54C-72-26-34-10 0 0Z" />
            <path d="M0 0C22 34 58 50 88 51C76 21 35 9 0 0Z" />
            <path d="M-79-48L0 0L77 45" className="leaf-veins" />
          </g>
        ))}
        <path d="M94 313C155 316 216 304 270 271C303 251 339 214 372 193C418 164 461 147 503 142C485 188 459 227 419 251C377 276 317 279 270 271" />
        <path d="M270 271C349 232 424 177 503 142M317 247L308 217M356 221L351 193M398 194L399 176M323 244L353 262M367 214L402 251M411 184L455 222" className="leaf-veins" />
      </g>
    </svg>
  );
}

export function PortraitUnderstory() {
  return (
    <svg className="portrait-understory" viewBox="0 0 240 200"
      fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 190C48 154 66 105 100 55C111 39 124 23 143 10" />
        <g className="understory-leaves">
          <path d="M50 145C17 134 7 108 8 82C35 88 54 115 50 145Z" />
          <path d="M68 106C109 104 139 88 154 55C115 54 78 76 68 106Z" />
          <path d="M100 55C75 42 65 22 68 5C91 12 107 31 100 55Z" />
          <path d="M36 170C91 174 137 151 170 109C115 111 58 136 36 170Z" />
        </g>
        <g className="understory-veins">
          <path d="M50 145L8 82M68 106L154 55M100 55L68 5M36 170L170 109" />
          <path d="M93 92L112 66M113 80L138 78M77 151L90 127M107 138L138 141" />
        </g>
      </g>
    </svg>
  );
}

const transitionBranches = [
  "M30 29C104 26 121 73 190 82C271 95 288 110 348 110",
  "M80 157C149 149 139 109 219 105C266 102 299 110 348 110",
  "M145 20C184 31 179 67 214 89C235 102 265 104 286 105",
  "M248 177C301 161 305 123 348 110",
  "M308 26C353 41 336 90 399 109",
  "M12 98C102 77 130 115 206 111C285 107 296 110 348 110C408 110 417 100 477 100H584L644 40H784",
  "M477 100H584L644 160H884",
  "M584 100H940",
];
const roots = [
  "M295 24C292 65 300 85 300 125C300 165 225 168 180 204L84 278",
  "M300 125C309 165 376 172 419 211L518 279",
  "M180 204C194 244 236 255 250 293V374",
  "M419 211C402 248 368 262 352 296V374",
  "M250 293C224 302 196 324 151 329H67",
  "M352 296C380 309 418 329 466 329H547",
];
const convergence = [
  "M560 416C472 402 464 340 379 316C301 294 244 265 209 220C181 184 174 141 143 103L91 51",
  "M558 321C485 317 479 361 425 343",
  "M421 422C413 377 438 350 379 316",
  "M533 184C453 171 396 232 332 287",
  "M303 419C332 368 273 314 244 265",
  "M370 98C361 164 277 200 209 220",
  "M92 327C161 321 169 254 188 183",
  "M212 70C221 98 187 134 174 149",
];

export function RiverNetwork({ variant }: {
  variant: "transition" | "roots" | "convergence";
}) {
  const paths = variant === "transition" ? transitionBranches : variant === "roots" ? roots : convergence;
  const nodes = variant === "transition"
    ? [[784, 40], [884, 160], [940, 100], [584, 100]]
    : variant === "roots"
      ? [[84, 278], [518, 279], [250, 374], [352, 374], [67, 329], [547, 329]]
      : [[533, 184], [370, 98], [92, 327]];
  return (
    <svg className={`river-network river-${variant}`}
      viewBox={variant === "transition" ? "0 0 1000 200" : "0 0 600 440"}
      fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((d, index) => (
          <path key={d} d={d} pathLength="1" className={index === 5 && variant === "transition" ? "river-primary" : undefined}
            vectorEffect="non-scaling-stroke" />
        ))}
        {nodes.map(([x, y]) => <rect key={`${x}-${y}`} x={x - 3} y={y - 3} width="6" height="6" />)}
        {variant === "convergence" && <path d="M91 76V51H116" className="convergence-arrow" />}
      </g>
    </svg>
  );
}

export function SystemTransition() {
  return (
    <div className="system-transition container" aria-hidden="true" data-reveal>
      <RiverNetwork variant="transition" />
    </div>
  );
}

export function BorneoBotanical() {
  return (
    <figure className="borneo-botanical">
      <BotanicalDrawing />
      <figcaption className="mono">
        <span>Borneo</span><span>Sabah, Malaysia</span>
      </figcaption>
    </figure>
  );
}
