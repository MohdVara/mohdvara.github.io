import BuildRevision from "./BuildRevision";
import { useState } from "react";
import { Navigation } from "./App";
import { PageLandscape } from "./AsciiForest/PageLandscape";
import CaseStudyQuickRead from "./CaseStudySummary";
import NaaeEvolution from "./NaaeEvolution";
import { text, localizedHref } from "./i18n/config";
import { useExperience } from "./i18n/context";
import { splitLocale } from "./i18n/localeResolution";
import { language } from "./i18n/languages";
import "./EngineeringCaseStudy.css";

const titles = {
  "mmcats-modern": {title: "Preserving legacy behavior through modernization."},
  naae: {title: "From ASCII objects to narrative visual worlds."},
  "multilingual-engineering": {title: "Engineering a portfolio for eleven languages."},
};
function Mmcats() {
  return <>
    <section id="architecture"><h2>{text("Behavior before replacement")}</h2>
      <p>{text("Discover legacy obligations → formalize behavioral contracts → implement modern boundaries → verify preserved behavior. Local verification and production acceptance are separate decisions.")}</p>
      <p>{text("Static legacy source shows Rails 4.1.8, Devise, SQLite, company/division/staff relationships and file attachments. The original application was not booted; real historical data was not migrated.")}</p>
      <p>{text("The modernization inventories behavior, defines parity contracts and makes ambiguous business policies explicit. PostgreSQL constraints protect relationships; lifecycle events retain actor/action history. MYR financial rules, Malaysian historical-time interpretation and UTC event timestamps have separate contracts.")}</p>
      <ol className="engineering-flow" aria-label={text("Modern architecture")}>
        <li><bdi>Rails 8.1.4 / Ruby 4.0.7</bdi><p>{text("Server-side authentication, roles and asset authorization")}</p></li>
        <li><bdi>PostgreSQL 18.6</bdi><p>{text("Constraints, lifecycle events and UTC audit records")}</p></li>
        <li><bdi>Active Storage</bdi><p>{text("Authorized private attachments and coordinated backup/restore")}</p></li>
        <li><bdi>Docker / kind / Podman</bdi><p>{text("Containerized single-replica deployment profiles")}</p></li>
      </ol>
      <h3>{text("Legacy behavior → modern implementation → evidence")}</h3>
      <div className="engineering-parity">
        <p>{text("Asset lifecycle → explicit transitions → repeated operations do not duplicate events")}</p>
        <p>{text("Relationships → database constraints → foreign-key and deletion contracts")}</p>
        <p>{text("Attachments → authorized private routes → exact-byte and revocation checks")}</p>
        <p>{text("Money and dates → MYR / MYT / UTC policies → synthetic boundary tests")}</p>
      </div>
    </section>
    <section id="verification"><h2>{text("Verification with a date and a boundary")}</h2>
      <p>{text("22 October 2026 · Render Free acceptance records 66 tests / 568 assertions, a 38-check read-only viewer contract and 31-check Docker/kind/Podman regressions. These are reported local checks, not a test run performed by this portfolio.")}</p>
      <p>{text("21 October 2026 · The earlier ARM64 candidate recorded 61 tests / 518 assertions, encrypted isolated restores and passing measured startup/resource budgets. Those measurements do not certify the later Render AMD64 artifact.")}</p>
      <p>{text("Security work includes server-side roles, private files, reduced container privileges, vulnerability disposition records and fail-closed gates. The 22 October AMD64 scan still reports 43 HIGH and 1 UNKNOWN finding; clearance remains blocked.")}</p>
      <p>{text("Render preparation is implemented locally. Strict emulated AMD64 load failed; native provider performance and off-host recovery are unverified. No public application deployment is established. Production integrations and security decisions remain pending.")}</p>
    </section>
    <section id="sources"><h2>{text("Sources and limitations")}</h2>
      <p>{text("Public source and recorded verification are available for inspection. Source publication does not authorize application deployment; security and provider acceptance remain blocked or unverified.")}</p>
      <p><a href="https://github.com/MohdVara/mmcats-modern">{text("View source on GitHub ")}<bdi>MMCATS Modern</bdi></a>{" · "}<a href="https://github.com/MohdVara/mmcats-modern/blob/main/docs/RENDER_FREE_ACCEPTANCE.md">{text("Inspect the evidence")}</a></p>
      <a href="https://github.com/MohdVara/mmcats-legacy">{text("Inspect the archived legacy source")}</a>
    </section>
  </>;
}
function DirectionDemo() {
  const [sample, setSample] = useState<"en" | "ar" | "ja">("en");
  const labels = {en: ["Public engineering", "Case study", "View evidence"], ar: ["الهندسة العامة", "دراسة حالة", "عرض الأدلة"], ja: ["公開エンジニアリング", "ケーススタディ", "根拠を見る"]};
  return <section id="direction-demo"><h2>{text("Direction follows the language")}</h2>
    <label>{text("Reading direction sample")} <select value={sample} onChange={event => setSample(event.target.value as typeof sample)}>
      <option value="en">English · LTR</option><option value="ar">العربية · RTL</option><option value="ja">日本語 · LTR</option>
    </select></label>
    <div className="direction-sample" dir={language(sample).direction} lang={sample} translate="no">
      <nav aria-label={text("Sample navigation")}><a href={localizedHref("/#public-engineering")}>{labels[sample][0]}</a><span aria-hidden="true"> / </span><span>{labels[sample][1]}</span></nav>
      <p><bdi dir="ltr">NAAE / TypeScript / v0.3.0</bdi></p>
      <a href="#localization-pipeline">{labels[sample][2]} <span aria-hidden="true">↓</span></a>
    </div>
    <p>{text("Arabic changes inline alignment and reading direction; technical identifiers remain isolated. Japanese stays horizontal here. Logical spacing follows direction, while keyboard focus follows DOM order. Optional Japanese/Chinese vertical typography is limited to editorial text; controls stay horizontal.")}</p>
  </section>;
}
function Multilingual() {
  return <>
    <section id="localization-pipeline"><h2>{text("One registry, one content workflow")}</h2>
      <ol className="engineering-flow" aria-label={text("Localization pipeline")}>
        <li>{text("Canonical English → AST string extraction")}</li>
        <li>{text("Incremental translation → source hashes and provenance")}</li>
        <li>{text("Catalog validation → coverage and editorial review")}</li>
        <li>{text("Lazy locale catalogs → static localized routes and metadata")}</li>
      </ol>
      <p>{text("React and i18next use languages.json for locale order, direction, fonts, calendars and writing modes. URL, saved preference, browser preference and English fallback resolve language in that order. Switching preserves route, query and fragment.")}</p>
      <p>{text("Extraction, validation, coverage and prerendering are scripted. Translation sync requires configured authoring credentials; new case-study translations were generated directly by the coding assistant. They are machine-translated and await fluent editorial review.")}</p>
      <p>{text("Every non-English page retains the localized disclosure near navigation and a matching English-original link. Canonical URLs are locale-specific; reciprocal hreflang links and x-default connect equivalent pages. Translation is performed during authoring, never from visitor conversations.")}</p>
    </section>
    <section id="adaptive-preferences"><h2>{text("Adaptive Preferences Across Scripts and Layouts")}</h2>
      <p>{text("Hidden language and display menus made global preferences harder to discover. The utility rail exposes five controls while reusing the existing preference services; its own state only manages disclosures.")}</p>
      <p>{text("One nonmodal panel opens at a time. Focus enters the panel without a trap; Escape and Close return it to the trigger. Navigation and outside clicks dismiss it. Detailed controls load on demand, with a retry action if loading fails.")}</p>
      <p>{text("Logical docking places the rail on the right in LTR and left in Arabic. Compact screens use an expandable Settings entry. Controls remain horizontal in vertical CJK mode; saved indicators synchronize after hydration. Language switching preserves route, query and fragment.")}</p>
      <p>{text("Privacy UI reuses existing consent state: opening a panel does not enable analytics. DNT/GPC suppression remains separate from saved consent. Keyboard, locale and automated accessibility checks support the implementation; screen-reader, physical-device and fluent translation review remain pending.")}</p>
      <figure className="engineering-evidence"><img src="/images/engineering/utility-ar.webp" width="1440" height="900" loading="lazy" decoding="async" alt={text("Arabic utility rail with the language panel open on the left.")} /><figcaption>{text("Local implementation capture: Arabic RTL docking and a horizontal language panel.")}</figcaption></figure>
      <p><a href="https://github.com/MohdVara/mohdvara.github.io/blob/3da08e4/src/UtilityRail.tsx">{text("Inspect the portfolio source")}</a>{" · "}<a href="https://github.com/MohdVara/mohdvara.github.io/blob/3da08e4/verification/portfolio-adaptive-utility-rail-v1.json">{text("Inspect the evidence")}</a></p>
    </section>
    <DirectionDemo />
    <section id="language-boundary"><h2>{text("A deliberate English-only boundary")}</h2>
      <p>{text("PACE-RAG professional questions, answers and evidence remain English-only. Its region retains lang=en, dir=ltr, translate=no and horizontal writing. Surrounding notices are localized; changing locale preserves the assistant and conversation state.")}</p>
      <p>{text("Font fallbacks, text scaling, reduced motion and RTL are presentation responsibilities. Automated browser checks support regression detection; native-language review, physical-device coverage and actual screen-reader sessions remain separate work.")}</p>
      <a href="https://github.com/MohdVara/mohdvara.github.io">{text("Inspect the portfolio source")}</a>
    </section>
  </>;
}
function Naae() {
  return <>
    <section id="evolution"><h2>{text("An artifact-backed evolution")}</h2>
      <p>{text("The canonical project name is Narrative ASCII Art Engine. Local documentation describes v0.1 object allocation and v0.2 layered landscapes. Saved v0.2, v0.3 and v0.4 outputs support the comparisons below; no Git history or tags were available to establish release dates.")}</p>
      <NaaeEvolution />
    </section>
    <section id="architecture"><h2>{text("Protect the story, then compose the texture")}</h2>
      <ol className="engineering-flow" aria-label={text("Artwork generation pipeline")}>
        <li>{text("Seeded scene graph → layered geometry and spatial regions")}</li>
        <li>{text("Physical budget → exact narrative allocation and source indices")}</li>
        <li>{text("Eligible cells → coverage, semantic glyphs and independent intensity")}</li>
        <li>{text("Integrity diagnostics → SVG text, PNG and scene configuration")}</li>
      </ol>
      <p>{text("Coverage counts visibly occupied eligible cells; protected narrative spaces are excluded. Intensity controls appearance independently of occupancy. Pixel-Hybrid adds stepped geometry and tile-coherent glyph selection while sharing narrative protection. Diagnostics are engineering checks, not aesthetic quality scores.")}</p>
      <p id="naae-limitations">{text("The studio/package v0.4 label is separate from rendererVersion: Organic uses 0.3.0; Pixel-Hybrid uses 0.4.0. Scene mode is experimental. Supported text is measured Latin ASCII; physical print quality and a public studio release are pending.")}</p>
    </section>
    <section id="visual-identity"><h2>{text("Engineering the Visual Identity: From Narrative Landscapes to Glyph-Based Portraits")}</h2>
      <p>{text("A portrait needs recognizable facial structure at a distance and authentic characters up close. Early tonal adjustments could not recover detail missing from the source grid. The portfolio reconstruction therefore works on an existing glyph SVG, not directly on a photograph.")}</p>
      <p>{text("Build-time analysis samples glyph luminance at three neighborhood scales. Font-calibrated ink coverage and local gradients guide bounded size and shape variants while preserving the character sequence. This is source-field analysis, not facial-landmark detection; it cannot invent missing anatomy.")}</p>
      <p>{text("Dark-mode amber supports luminous strokes. Light-mode glyph experiments needed separate ink palettes, tonal mappings and reduced background competition; bright eye highlights and pale small glyphs exposed the limits of palette changes. The current homepage selects a separate illustration in light mode and the reconstructed glyph SVG in dark mode.")}</p>
      <div className="evolution-grid">
        <figure className="engineering-evidence"><img src="/images/engineering/identity-dark.webp" width="1440" height="900" loading="lazy" decoding="async" alt={text("Dark homepage with an amber glyph portrait in the narrative landscape.")} /><figcaption>{text("Local dark treatment: actual SVG characters, reconstructed before runtime.")}</figcaption></figure>
        <figure className="engineering-evidence"><img src="/images/engineering/identity-light.webp" width="1440" height="900" loading="lazy" decoding="async" alt={text("Light homepage with a separate illustrated portrait in the landscape.")} /><figcaption>{text("Local light treatment: a separate illustration, not an ASCII portrait.")}</figcaption></figure>
      </div>
      <p>{text("Deterministic reconstruction and geometry tests make the transformation inspectable. These portfolio-specific experiments do not establish standalone NAAE photo support. The captures show current treatments, not a historical before/after benchmark; identity recognition and deployed parity are not independently established.")}</p>
      <p><a href="https://github.com/MohdVara/mohdvara.github.io/blob/3da08e4/scripts/artwork/portrait-v3.mjs">{text("Inspect the portfolio source")}</a>{" · "}<a href="https://github.com/MohdVara/mohdvara.github.io/blob/3da08e4/docs/portfolio/NAAE_PORTRAIT_V3_IMPLEMENTATION.md">{text("Inspect the evidence")}</a></p>
    </section>
    <section id="unmapped-path"><h2>{text("The Unmapped Path: narrative typography for recovery")}</h2>
      <p>{text("The 404 scene applies the same visual language to a useful failure state: seeded SVG-text ridges and a vanishing trail support a localized explanation, quote and recovery links. Compact screens receive a separate composition; decorative glyphs remain hidden from assistive technology.")}</p>
      <p>{text("Static localized fallback documents preserve recovery without JavaScript. Recorded local Pages checks returned HTTP 404 for missing paths and 200 for known routes; this is local hosting evidence, not live deployment verification. The artwork is distinct from the homepage and imports no studio engine.")}</p>
      <p><a href="https://github.com/MohdVara/mohdvara.github.io/blob/3da08e4/docs/portfolio/NAAE_404_EXPERIENCE_V1.md">{text("Inspect the evidence")}</a></p>
    </section>

  </>;
}
export default function EngineeringCaseStudy() {
  const { path } = useExperience();
  const route = splitLocale(path).path.split("/").filter(Boolean)[0];
  const study = route === "mmcats-modern" || route === "naae" ? route : "multilingual-engineering";
  return <><a className="skip-link" href="#main">{text("Skip to content")}</a><Navigation home={false} contactOnPage={false} />
    <main id="main" tabIndex={-1} className="container engineering-case">
      <PageLandscape scene="pace" contained><header className="container page-landscape-intro">
        <p className="eyebrow mono">{study === "multilingual-engineering" ? text("The portfolio as an engineering artifact") : text("Independent engineering")}</p>
        <h1>{text(titles[study].title)}</h1><a href={localizedHref("/#public-engineering")}>{text("Public engineering")} ↑</a>
      </header></PageLandscape>
      <CaseStudyQuickRead study={study} />
      {study === "mmcats-modern" ? <Mmcats /> : study === "naae" ? <Naae /> : <Multilingual />}
      <footer><a href={localizedHref("/#public-engineering")}>{text("Return to public engineering")}</a><BuildRevision /></footer>
    </main>
  </>;
}
