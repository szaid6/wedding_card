import type { CSSProperties } from "react";
import type { TemplateId } from "./invitation";

export type TemplateTheme = {
  assets: { music: string };
  /** Exposed as CSS variables and mapped to Tailwind colors in globals.css. */
  colors: {
    ink: string;
    names: string;
    primary: string;
    foreground: string;
    muted: string;
    accent: string;
    divider: string;
    cream: string;
    field: string;
    fieldBorder: string;
    pageBg: string;
    /** Ornaments, borders and highlights. */
    gold: string;
    goldLight: string;
    /** The deep green behind the cards, and a lighter green for panels. */
    emerald: string;
    emeraldLight: string;
    maroon: string;
  };
  scratch: { gradient: [string, string, string]; speck: [string, string, string]; sparkle: string };
  confetti: string[];
};

// Indian Muslim wedding: emerald, antique gold, ivory and maroon.
const noor: TemplateTheme = {
  assets: { music: "/templates/noor/music.mp3" },
  colors: {
    ink: "#23362e",
    names: "#1c4d3f",
    primary: "#1d5c4a",
    foreground: "#22302a",
    muted: "#5e6b62",
    accent: "#8c2f39",
    divider: "#c9a24d",
    cream: "#fdf8ec",
    field: "#f6eddb",
    fieldBorder: "#e3d2ad",
    pageBg: "#0f3d33",
    gold: "#b8893b",
    goldLight: "#e6c97e",
    emerald: "#0f3d33",
    emeraldLight: "#1d5c4a",
    maroon: "#8c2f39",
  },
  scratch: {
    gradient: ["#f6e7bd", "#c9a24d", "#7d5d24"],
    speck: ["255, 244, 214", "214, 178, 96", "125, 93, 36"],
    sparkle: "255, 250, 235",
  },
  confetti: ["#8c2f39", "#c0485a", "#e6c97e", "#f3b6be", "#b8893b"],
};

// Sea styles itself; it shares Noor's music.
const TEMPLATES: Record<TemplateId, TemplateTheme> = {
  noor,
  sea: noor,
};

export function getTheme(id: TemplateId): TemplateTheme {
  return TEMPLATES[id];
}

export function themeStyle(theme: TemplateTheme): CSSProperties {
  const c = theme.colors;
  return {
    "--t-ink": c.ink,
    "--t-names": c.names,
    "--t-primary": c.primary,
    "--t-foreground": c.foreground,
    "--t-muted": c.muted,
    "--t-accent": c.accent,
    "--t-divider": c.divider,
    "--t-cream": c.cream,
    "--t-field": c.field,
    "--t-field-border": c.fieldBorder,
    "--t-page-bg": c.pageBg,
    "--t-gold": c.gold,
    "--t-gold-light": c.goldLight,
    "--t-emerald": c.emerald,
    "--t-emerald-light": c.emeraldLight,
    "--t-maroon": c.maroon,
  } as CSSProperties;
}
