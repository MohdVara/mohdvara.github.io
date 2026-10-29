import { useState } from "react";
import { calendarDate } from "./i18n/formatting";
import { paceStarterQuestions } from "./paceConversation";
import { text } from "./i18n/config";
import { useExperience } from "./i18n/context";
import { paceLinks } from './paceLinks';
import Assistant from '@pace-rag/portfolio-assistant';
import '@pace-rag/portfolio-assistant/style.css';

export default function PaceAssistant({onClose}: {onClose: () => void}) {
  const {locale,calendarMode} = useExperience();
  const [freshness,setFreshness]=useState<{snapshotId:string;indexedAt:string|null}|null>(null);
  return <div className="pace-english-boundary" lang="en" dir="ltr" translate="no">
    <p lang={locale} dir="auto" translate="yes">{text("PACE-RAG supports English questions and answers only. Please ask your question in English.")}</p>
    {freshness&&<div className="content-freshness" lang={locale} dir="auto" translate="yes">
      <p>{freshness.indexedAt ? <>{text("Knowledge last synchronized:")} <time dateTime={freshness.indexedAt} title={freshness.indexedAt}><bdi>{calendarDate(freshness.indexedAt.slice(0,10),locale,'day',calendarMode)}</bdi> <bdi dir="ltr">UTC</bdi></time></> : text("Knowledge synchronization date unavailable.")}</p>
      <p>{text("This assistant uses a reviewed snapshot of the portfolio and its published supporting sources. Repository changes after this snapshot may not yet be included.")}</p>
    </div>}
    <Assistant semanticMessages={{locale,
      lexical: text("Results are ready. You can keep searching."),
      improving: text("Improving suggestions. You can keep searching."),
      available: text("Suggestions updated. Similarity does not verify an answer."),
      unavailable: text("Enhanced search is unavailable. Your existing results remain usable."),
      cancelled: text("Enhancement cancelled. Your existing results remain usable."),
      deferred: text("Results are ready. Enhanced search is optional."),
      improve: text("Improve suggestions"), retry: text("Retry enhanced search"), cancel: text("Cancel enhancement"),
    }} onKnowledgeFreshness={setFreshness} corpusId="portfolio" scopeId="professional" assetBase="/pace-rag/" presentation="portfolio" starterQuestions={paceStarterQuestions} libraryExternal labUrl={paceLinks.lab} onClose={onClose} /></div>;
}
