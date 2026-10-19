// Development origins are compiled away from canonical production builds.
const labRoot = import.meta.env.DEV
  ? (import.meta.env.VITE_PACE_LAB_URL || 'http://127.0.0.1:5180/pace-rag/')
  : 'https://pace-reg.paramasvara.online/pace-rag/';
export const paceLinks = {
  lab: labRoot,
  architecture: new URL('architecture.html', labRoot).href,
  evaluation: new URL('evaluation.html', labRoot).href,
  caseStudy: '/pace-rag-case-study/',
};
