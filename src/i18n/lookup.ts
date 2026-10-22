export function translateSource(source: string, catalog: Record<string, string>, translate: (key: string, values?: Record<string,string|number>) => string, values?: Record<string,string|number>): string {
  const key = source.trim().replace(/\s+/g, " ");
  if (!Object.prototype.hasOwnProperty.call(catalog, key)) return source;
  return source.replace(source.trim(), translate(key, values));
}
