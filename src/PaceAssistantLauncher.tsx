import { localizedHref } from "./i18n/config";
import { text, localizedContent } from "./i18n/config";
import {paceLinks} from "./paceLinks";
import {Component, lazy, Suspense, useRef, useState, type ReactNode} from 'react';
import './PaceAssistantLauncher.css';

const Assistant = lazy(() => import('./PaceAssistant'));
const library = '/pace-rag/knowledge/professional/index.html';

class AssistantRecovery extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {
    return this.state.failed ? <p role="status">{text("The assistant could not load. ")}<a href={localizedHref(library)}>{text("Read the source library")}</a>{text(" or try opening it again.")}</p> : this.props.children;
  }
}

export default function PaceAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const disclosure = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  function close() {
    if (disclosure.current) disclosure.current.open = false;
    setOpen(false);
    summary.current?.focus();
  }
  return <details ref={disclosure} className="experience-assistant" onToggle={event => setOpen(event.currentTarget.open)}>
    <summary ref={summary}>{text("Ask about my engineering experience")}</summary>
    <div id="pace-assistant-region" role="region" aria-label={text("Engineering experience assistant")}>
      <p className="experience-assistant-intro">{text("Explore my professional experience through concise answers and supporting sources. Search runs on your device. Live AI is disabled.")}</p>
      <p>{text("Enter an English question. Suggested questions and answers remain in English when you change the portfolio language.")}</p>
      {localizedContent(open && <AssistantRecovery><Suspense fallback={<p role="status">{text("Loading the knowledge assistant…")}</p>}><Assistant onClose={close} /></Suspense></AssistantRecovery>)}
      <p className="experience-assistant-links"><a href={localizedHref(library)}>{text("Browse professional sources")}</a><a href={localizedHref(paceLinks.lab)}>{text("Explore the Engineering RAG Lab ↗")}</a></p>
      <noscript><p>{text("Interactive search needs JavaScript. The source library and Lab documentation remain readable.")}</p></noscript>
    </div>
  </details>;
}
