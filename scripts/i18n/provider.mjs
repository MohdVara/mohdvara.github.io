// This module is authoring-only. No import from src/, no VITE_* credentials.
export function createProvider({apiKey, model, fetchImpl = fetch, wait = ms => new Promise(resolve => setTimeout(resolve, ms))}) {
  if (!apiKey || !model) throw new Error("Set OPENAI_API_KEY and OPENAI_TRANSLATION_MODEL explicitly. No model is assumed.");
  return {async translate({locale, strings, glossary, context}) {
    const keys = Object.keys(strings);
    const request = {
      model, store: false,
      instructions: `${glossary.instructions} Translate English to ${locale}. Preserve all interpolation placeholders, links and these terms exactly: ${glossary.protected.join(", ")}. Return plain strings, no HTML. Do not change claims or add facts.`,
      input: JSON.stringify({context, strings}),
      text: {format: {type:"json_schema",name:"portfolio_translation",strict:true,schema:{type:"object",properties:Object.fromEntries(keys.map(key => [key,{type:"string"}])),required:keys,additionalProperties:false}}},
    };
    for (let attempt = 0; attempt < 5; attempt++) {
      let response;
      try {
        response = await fetchImpl("https://api.openai.com/v1/responses", {
          method:"POST", headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},
          body:JSON.stringify(request), signal:AbortSignal.timeout(90000),
        });
      } catch (error) {
        if (attempt === 4) throw new Error(`Translation network request failed: ${error.name}`);
        await wait(Math.min(16000, 1000 * 2 ** attempt)); continue;
      }
      if (!response.ok) {
        if ((response.status === 429 || response.status >= 500) && attempt < 4) {
          await wait(Math.min(16000, 1000 * 2 ** attempt)); continue;
        }
        // Never print response bodies or authorization headers.
        throw new Error(`Translation provider HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.status !== "completed") throw new Error("Translation response incomplete or refused");
      const raw = result.output?.flatMap(item => item.content || []).filter(item => item.type === "output_text").map(item => item.text).join("");
      const translations = JSON.parse(raw);
      if (!translations || Array.isArray(translations) || Object.keys(translations).length !== keys.length || keys.some(key => typeof translations[key] !== "string") || Object.keys(translations).some(key => !keys.includes(key))) throw new Error("Provider output schema mismatch");
      return {translations, usage:result.usage || {}, model:result.model || model};
    }
    throw new Error("Translation retry budget exhausted");
  }};
}
