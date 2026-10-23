import { useExperience } from "./i18n/context";
import { text } from "./i18n/config";
import { languages } from "./i18n/languages";
import { ReadingModeToggle } from "./i18n/controls";
import { AnalyticsControl, TextSizeControl, ThemeControl } from "./UtilityPreferences";
import { SceneryControl } from "./AsciiForest/SceneryControl";

// Detailed controls are fetched only after a visitor opens a preference.
export default function UtilityPanel({ control, close }: { control: string; close: () => void }) {
  const { locale, busy, error, changeLocale } = useExperience();
  if (control === "language") return <><label className="theme-control"><span>{text("Language")}</span><select aria-label={text("Language")} value={locale} aria-busy={busy} onChange={async event => {
    const selected = languages.find(item => item.locale === event.target.value);
    if (selected && await changeLocale(selected.locale)) close();
  }}>{languages.map(item => <option key={item.locale} value={item.locale} lang={item.locale} dir={item.direction}>{item.nativeName} · {item.englishName}</option>)}</select></label>
    {error && <p>{error}</p>}{locale !== "en" && <p className="translation-status">{text("Machine translated from English")}</p>}<ReadingModeToggle /></>;
  return control === "theme" ? <ThemeControl /> : control === "size" ? <TextSizeControl /> : control === "motion" ? <SceneryControl /> : <AnalyticsControl />;
}
