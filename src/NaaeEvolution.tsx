import { useState } from "react";
import { text } from "./i18n/config";
import artifacts from "./data/naae-evolution.json";
const descriptions = [
  "v0.2 · Layered landscape; saved reproduction from the compatible v0.2 renderer, generated during v0.3 baseline export.",
  "v0.3 · Continuous eligible-cell coverage with independent visual intensity and semantic texture.",
  "v0.4 · Pixel-Hybrid landscape with stepped contours and protected narrative characters.",
];
function Artwork({ index, zoom, label }: {index: number; zoom: number; label: string}) {
  const [failed, setFailed] = useState(false);
  const item = artifacts[index];
  return <figure>
    <div className="evolution-viewport" tabIndex={0} role="region" aria-label={`${text(label)}: ${text("Artwork detail; use arrow keys to scroll when zoomed")}`}>
      {failed ? <p className="evolution-missing" role="status">{text("Artwork unavailable. The configuration and milestone description remain below.")}</p> :
        <img src={item.preview} width={item.previewWidth} height={item.previewHeight} style={{width:`${zoom}%`}} loading="lazy" decoding="async" alt={text("Glyph-based Borneo landscape with mountains, forest and a river; narrative text forms part of the scene.")} onError={() => setFailed(true)} />}
    </div>
    <figcaption>{text(descriptions[index])}</figcaption>
    <details><summary>{text("Reproduction configuration")}</summary><pre lang="en" dir="ltr" translate="no">{JSON.stringify(item.config,null,2)}</pre><p><a href={item.original} download>{text("Download original glyph SVG")}</a></p><p className="mono"><bdi>{item.sha256}</bdi></p></details>
  </figure>;
}
export default function NaaeEvolution() {
  const [left,setLeft] = useState(0), [right,setRight] = useState(1), [zoom,setZoom] = useState(100);
  return <div className="evolution-explorer">
    <p>{text("v0.1 is documented as an object-based allocator; no verified v0.1 output is shown. Compare saved stages side by side. Framing and rendering settings differ, so this is not a controlled visual-quality benchmark.")}</p>
    <div className="evolution-controls">
      {([ ["Earlier stage",left,setLeft], ["Comparison stage",right,setRight] ] as const).map(([label,value,set], side) => <fieldset key={label}><legend>{text(label)}</legend><div className="evolution-stages">{artifacts.map((item,index) => <label key={item.id}><input type="radio" name={`evolution-stage-${side}`} value={index} checked={value === index} onChange={() => set(index)} /><bdi>{item.id}</bdi></label>)}</div></fieldset>)}
      <label>{text("Detail zoom")} <input type="range" min="100" max="400" step="25" value={zoom} onChange={event => setZoom(Number(event.target.value))} /> <output dir="ltr">{zoom}%</output></label>
      <button onClick={() => setZoom(100)}>{text("View from a distance")}</button>
    </div>
    <div className="evolution-grid"><Artwork key={`left-${left}`} index={left} zoom={zoom} label="Earlier stage" /><Artwork key={`right-${right}`} index={right} zoom={zoom} label="Comparison stage" /></div>
    <p>{text("Interactive studio — local prototype / public release pending")}</p>
  </div>;
}
