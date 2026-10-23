import { splitLocale } from "./localeResolution";
import type { Locale } from "./languages";

// A cached document can resume with locale loads still pending from an older
// history entry. Only the most recent entry may update language or React state.
export function createLocaleRestorer(options: {
  path: () => string;
  load: (locale: Locale) => Promise<void>;
  change: (locale: Locale) => Promise<unknown>;
  commit: (path: string) => void;
  failed: () => void;
}) {
  let generation = 0;
  return {
    cancel() { generation++; },
    async restore() {
      const current = ++generation;
      const path = options.path();
      const active = () => current === generation && path === options.path();
      const locale = splitLocale(path).locale || "en";
      try {
        await options.load(locale);
        if (!active()) return;
        await options.change(locale);
        if (active()) options.commit(path);
      } catch {
        if (active()) options.failed();
      }
    },
  };
}
