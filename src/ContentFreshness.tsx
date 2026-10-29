import revisions from './data/content-freshness.json';
import { text } from './i18n/config';
import { useExperience } from './i18n/context';
import { calendarDate } from './i18n/formatting';
import './ContentFreshness.css';
function FreshnessTime({value}: {value: string}) {
  const {locale,calendarMode}=useExperience();
  return <time dateTime={value} title={value}><bdi>{calendarDate(value.slice(0,10),locale,'day',calendarMode)}</bdi> <bdi dir="ltr">UTC</bdi></time>;
}
export default function ContentFreshness({contentId}: {contentId:string}) {
  const {locale}=useExperience();
  const value=revisions[contentId as keyof typeof revisions];
  if(!value)return null;
  return <p className="content-freshness">{locale==='en'?text('Content last revised:'):text('Canonical English content last revised:')} <FreshnessTime value={value}/></p>;
}
export function SiteBuildFreshness() {
  return <p className="content-freshness">{text('Site build:')} <FreshnessTime value={__SITE_BUILD_INFO__.generatedAt}/></p>;
}
