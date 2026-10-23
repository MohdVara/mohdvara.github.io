import vocabulary from "../artwork/vocabulary.json";
import { text } from "../i18n/config";
import { useExperience } from "../i18n/context";
import "./NarrativeArtwork.css";

export function NarrativeAccent({ region }: { region: 'forest'|'mountains'|'earth'|'river' }) {
  const {locale} = useExperience();
  return <div className={`narrative-accent narrative-accent-${region}`} aria-hidden="true" lang={locale}>{vocabulary.entries.filter(entry => entry.category === region && entry.visible).map(entry => text(entry.key)).join(' · ')}</div>;
}
