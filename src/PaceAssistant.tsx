import { paceStarterQuestions } from "./paceConversation";
import { text } from "./i18n/config";
import { useExperience } from "./i18n/context";
import { paceLinks } from './paceLinks';
import Assistant from '@pace-rag/portfolio-assistant';
import '@pace-rag/portfolio-assistant/style.css';

export default function PaceAssistant({onClose}: {onClose: () => void}) {
  const {locale} = useExperience();
  return <div className="pace-english-boundary" lang="en" dir="ltr" translate="no">
    <p lang={locale} dir="auto" translate="yes">{text("PACE-RAG supports English questions and answers only. Please ask your question in English.")}</p>
    <Assistant corpusId="portfolio" scopeId="professional" assetBase="/pace-rag/" presentation="portfolio" starterQuestions={paceStarterQuestions} libraryExternal labUrl={paceLinks.lab} onClose={onClose} /></div>;
}
