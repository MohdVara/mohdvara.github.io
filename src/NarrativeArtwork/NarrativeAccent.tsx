import { narrativeAccents } from "./assets";
import "./NarrativeArtwork.css";

export function NarrativeAccent({ region }: { region: keyof typeof narrativeAccents }) {
  return <div className={`narrative-accent narrative-accent-${region}`} aria-hidden="true">{narrativeAccents[region]}</div>;
}
