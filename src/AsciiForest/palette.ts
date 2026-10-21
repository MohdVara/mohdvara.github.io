import type { ForestTheme } from "./config";

// Distance loses contrast and saturation. Palettes share the exact scene data.
export const palettes: Record<ForestTheme, readonly (readonly string[])[]> = {
  dark: [
    ["#36515b", "#456570", "#507780", "#5c8187"],
    ["#29463f", "#375c51", "#4c7362", "#648979"],
    ["#1d392c", "#31543b", "#4d7148", "#789563"],
    ["#172b21", "#2f4d31", "#527044", "#90a66a"],
  ],
  light: [
    ["#7894a0", "#86a0aa", "#93aab0", "#9db3b6"],
    ["#8aab9c", "#779c89", "#648f7b", "#517e6a"],
    ["#709174", "#577e60", "#406c4c", "#315e3b"],
    ["#466f52", "#375e3f", "#2c5233", "#22482c"],
  ],
};

// Daylight uses a quiet sage interior with firm crown/trunk ink. This palette
// belongs to code-canopy forests; river artwork keeps its established ink.
export const daylightCodeCanopy = [
  ["#9aaeb5", "#a6b8bc", "#b2c1c3", "#bfcbca"],
  ["#c0cbb9", "#a8baa0", "#819b76", "#607e54"],
  ["#b4c2a9", "#94ab85", "#68885a", "#426438"],
  ["#a6b59b", "#8da17c", "#5d794e", "#3c5933"],
] as const;
