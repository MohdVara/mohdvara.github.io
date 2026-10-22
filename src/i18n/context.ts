import { createContext, useContext } from "react";
import type {Locale, WritingMode} from "./languages";
export const ExperienceContext = createContext({path: "/", locale: "en" as Locale, writingMode: "horizontal" as WritingMode, busy: false, error: "", changeLocale: (() => {}) as (locale: Locale) => void, changeWritingMode: (() => {}) as (mode: WritingMode) => void});
export const useExperience = () => useContext(ExperienceContext);
