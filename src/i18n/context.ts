import { createContext, useContext } from "react";
import type {Locale, WritingMode} from "./languages";
import type { CalendarDisplayMode } from "./formatting";
export const ExperienceContext = createContext({path: "/", locale: "en" as Locale, writingMode: "horizontal" as WritingMode, calendarMode: "cultural" as CalendarDisplayMode, changeCalendarMode: (() => {}) as (mode: CalendarDisplayMode) => void, busy: false, error: "", changeLocale: (async () => false) as (locale: Locale) => Promise<boolean>, changeWritingMode: (() => {}) as (mode: WritingMode) => void});
export const useExperience = () => useContext(ExperienceContext);
