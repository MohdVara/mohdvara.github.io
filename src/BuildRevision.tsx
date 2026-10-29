import { SiteBuildFreshness } from "./ContentFreshness";
import { text } from "./i18n/config";

export default function BuildRevision() {
  if (!__BUILD_REVISION__) return <SiteBuildFreshness />;
  return <><SiteBuildFreshness /><a className="build-revision" href={`https://github.com/MohdVara/mohdvara.github.io/commit/${__BUILD_REVISION__}`}>
    {text("View source on GitHub")}
    <span aria-hidden="true">·</span>
    <code dir="ltr" translate="no">{__BUILD_REVISION__.slice(0, 7)}</code>
  </a></>;
}
