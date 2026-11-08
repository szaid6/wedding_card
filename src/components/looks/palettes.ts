/** The light at each point of the evening, from daylight to night. */
export type Tone = "day" | "dusk" | "twilight" | "night" | "deep";

/** One moment of the sky: its colour, the text on it, and the highlight text (times, Arabic). */
type Light = { sky: string; ink: string; hi: string };

export type Palette = {
  name: string;
  /** Buttons, sea waves and the shoreline. */
  accent: string;
  onAccent: string;
  sun: string;
  moon: string;
  moonDark: string;
  /**
   * A dusky rose the sky passes through between sunset and twilight. Orange blended
   * straight into green goes through olive; real skies darken through rose instead.
   */
  afterglow?: string;
  tones: Record<Tone, Light>;
};

export const PALETTES = {
  pearl: {
    name: "Emerald & Pearl",
    accent: "#d4ad5f",
    onAccent: "#13362e",
    sun: "#fbe6b2",
    moon: "#f4e6bd",
    moonDark: "#1e4a40",
    afterglow: "#8a5a5c",
    tones: {
      day: { sky: "#f4eee2", ink: "#173a31", hi: "#9a6a2e" },
      dusk: { sky: "#dca26f", ink: "#2b1d12", hi: "#6f2f1f" },
      twilight: { sky: "#3d6b5f", ink: "#f7f1e3", hi: "#f2d698" },
      night: { sky: "#1d4a3f", ink: "#f7f1e3", hi: "#e9c97f" },
      deep: { sky: "#0f2f28", ink: "#f7f1e3", hi: "#e9c97f" },
    },
  },
  lapis: {
    name: "Rose & Lapis",
    accent: "#e2bf74",
    onAccent: "#1b2b47",
    sun: "#fff0cf",
    moon: "#f6ead0",
    moonDark: "#24365a",
    tones: {
      day: { sky: "#f6efe6", ink: "#23314a", hi: "#a0563f" },
      dusk: { sky: "#e9b08b", ink: "#2b1d17", hi: "#7d2f2a" },
      twilight: { sky: "#9c5f6d", ink: "#fff6ee", hi: "#ffe0ae" },
      night: { sky: "#34507a", ink: "#f8f2e8", hi: "#f1d29a" },
      deep: { sky: "#1b2b47", ink: "#f8f2e8", hi: "#f1d29a" },
    },
  },
  saffron: {
    name: "Saffron & Jade",
    accent: "#d9a441",
    onAccent: "#1f2a1e",
    sun: "#fff1c9",
    moon: "#f5e9c4",
    moonDark: "#2a4a3d",
    afterglow: "#8f5a52",
    tones: {
      day: { sky: "#f0e7d2", ink: "#2c3a2a", hi: "#a3412c" },
      dusk: { sky: "#de9a45", ink: "#2a1a0c", hi: "#6e2416" },
      twilight: { sky: "#5b7a57", ink: "#fbf5e6", hi: "#ffe0a3" },
      night: { sky: "#2e5546", ink: "#fbf5e6", hi: "#f0cf86" },
      deep: { sky: "#1a3329", ink: "#fbf5e6", hi: "#f0cf86" },
    },
  },
} satisfies Record<string, Palette>;

export type PaletteId = keyof typeof PALETTES;

/** How many stars are out at each moment. */
export const STARS: Record<Tone, number> = { day: 0, dusk: 0, twilight: 0.35, night: 0.75, deep: 1 };
