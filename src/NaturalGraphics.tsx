// Abstract frond, leaf-vein, and drainage-inspired geometry.
// Not a botanical specimen or a claim about project implementation topology.
// Decorative geometry stays code-native and shares the section reveal observer.
const frondLeaflets = [
  [128, 287, -35, 1.0], [166, 263, -37, 0.95], [205, 233, -40, 0.9],
  [242, 203, -42, 0.82], [278, 165, -47, 0.73], [313, 123, -51, 0.62],
  [344, 82, -55, 0.48],
] as const;

export function BotanicalDrawing({ className = "" }: { className?: string }) {
  return (
    <svg className={`botanical-drawing ${className}`} viewBox="0 0 560 350"
      fill="none" aria-hidden="true" focusable="false" data-ambient="">
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M67 322C166 286 252 205 313 123C352 70 374 37 390 18" className="frond-spine" />
        {frondLeaflets.map(([x, y, angle, scale]) => (
          <g key={x} transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
            <path d="M0 0C-18-41-62-53-91-54C-72-26-34-10 0 0Z" />
            <path d="M0 0C22 34 58 50 88 51C76 21 35 9 0 0Z" />
            <path d="M-79-48L0 0L77 45" className="leaf-veins" pathLength="1" />
          </g>
        ))}
        <path d="M94 313C155 316 216 304 270 271C303 251 339 214 372 193C418 164 461 147 503 142C485 188 459 227 419 251C377 276 317 279 270 271" />
        <path d="M270 271C349 232 424 177 503 142M317 247L308 217M356 221L351 193M398 194L399 176M323 244L353 262M367 214L402 251M411 184L455 222" className="leaf-veins" pathLength="1" />
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
function RiverTransition() {
  const nodes = [[784, 40], [884, 160], [940, 100], [584, 100]];
  return <svg className="river-network river-transition" viewBox="0 0 1000 200"
    fill="none" aria-hidden="true" focusable="false">
    <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
      {transitionBranches.map((d, index) => <path key={d} d={d} pathLength="1"
        className={index === 5 ? "river-primary" : undefined} vectorEffect="non-scaling-stroke" />)}
      {nodes.map(([x, y]) => <rect key={`${x}-${y}`} x={x - 3} y={y - 3} width="6" height="6" />)}
    </g>
  </svg>;
}

export function SystemTransition() {
  return (
    <div className="system-transition container" aria-hidden="true" data-reveal data-motion-region="transition">
      <RiverTransition />
    </div>
  );
}

export function BorneoBotanical() {
  return (
    <figure className="borneo-botanical" data-reveal>
      <div className="botanical-plate">
        <BotanicalDrawing />
        <svg className="plate-annotations" viewBox="0 0 560 350" fill="none" aria-hidden="true" focusable="false">
          <g stroke="currentColor" strokeWidth=".8">
            <path d="M342 85H434L459 60H535M201 232H114L90 210H20M391 217H466L488 242H540" />
            <path d="M15 25V175M10 25H20M10 55H18M10 85H20M10 115H18M10 145H20M10 175H20M412 314H536M412 310V318M443 312V316M474 310V318M505 312V316M536 310V318" />
            <circle cx="342" cy="85" r="3" /><circle cx="201" cy="232" r="3" /><circle cx="391" cy="217" r="3" />
          </g>
          <g fill="currentColor" className="plate-labels"><text x="462" y="52">01 / BRANCH</text><text x="20" y="202">02 / FLOW</text><text x="473" y="259">03 / VEIN</text><text x="415" y="336">STRUCTURE STUDY</text></g>
        </svg>
      </div>
      <figcaption className="mono">
        <span>Borneo</span><span>Sabah, Malaysia</span>
      </figcaption>
    </figure>
  );
}

export function ContactConvergence() {
  return <div className="contact-convergence" aria-hidden="true">
    <svg viewBox="0 0 600 400" preserveAspectRatio="none" fill="none" focusable="false">
      <g className="convergence-outer">
        <path pathLength="1" d="M590 34C512 35 536 165 451 193" />
        <path pathLength="1" d="M562 388C480 373 512 269 451 193" />
        <path pathLength="1" d="M590 130C527 126 522 174 451 193" />
        <path pathLength="1" d="M579 310C525 304 519 227 451 193" />
        <path pathLength="1" d="M394 14C388 99 377 162 451 193" />
      </g>
      <path className="convergence-merge" pathLength="1" d="M451 193C364 173 362 264 273 278" />
      <path className="convergence-final" pathLength="1" d="M273 278C191 291 149 307 57 307H18" />
      <path className="convergence-tip" d="M26 299L18 307L26 315" />
      <circle className="convergence-end" cx="18" cy="307" r="6" />
      <g className="convergence-ticks"><circle cx="451" cy="193" r="4" /><circle cx="273" cy="278" r="4" /><path d="M566 34H590M590 22V46M550 388H574M562 376V400" /></g>
    </svg>
  </div>;
}

// Header studies echo the existing botanical/system language, without topology claims.
export function SectionBranch({ variant }: { variant: "work" | "public" }) {
  return <svg className={`section-branch section-branch-${variant}`} viewBox="0 0 480 260" fill="none" aria-hidden="true" focusable="false">
    <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      {variant === "work" ? <>
        <path d="M18 222C109 204 116 136 215 135C298 134 316 62 423 38" />
        <path className="lead-branch-secondary" d="M85 202C80 146 111 100 168 70C158 128 127 173 85 202ZM215 135C257 167 309 178 362 153C321 128 263 113 215 135" />
        <path className="lead-branch-secondary" d="M85 202L155 88M215 135L345 153M161 144C145 110 150 80 190 39M288 101C319 114 359 110 400 91" />
        <path d="M341 64C355 41 361 24 359 12M423 38H458" />
        <circle cx="215" cy="135" r="4" /><circle cx="423" cy="38" r="4" />
        <path d="M453 31H467M460 24V38" />
      </> : <>
        <path d="M22 224C121 224 151 152 224 143C297 134 326 91 369 71H453" />
        <path className="lead-branch-secondary" d="M91 213C115 160 98 97 164 49C169 109 157 157 128 188M224 143C269 177 326 189 400 174C353 145 288 130 224 143" />
        <path className="lead-branch-secondary" d="M128 188L155 70M224 143L382 173M278 123C302 88 286 48 337 18M319 100C363 112 387 132 453 132" />
        <path d="M369 71C405 70 407 28 453 28" />
        <rect x="449" y="24" width="8" height="8" /><rect x="449" y="67" width="8" height="8" />
        <circle cx="224" cy="143" r="4" />
      </>}
    </g>
  </svg>;
}
