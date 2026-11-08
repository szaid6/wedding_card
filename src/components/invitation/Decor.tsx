"use client";

import { useId, type CSSProperties } from "react";

/** useId() output isn't always safe inside url(#...), so strip it down. */
function useSvgId(prefix: string) {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

const GOLD = "#c9a24d";
const GOLD_LIGHT = "#e6c97e";

/** Eight-point star (two overlapping squares), centered in a 20x20 box. */
export function Star8({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="-10 -10 20 20" className={className} style={style} aria-hidden>
      <rect x="-6" y="-6" width="12" height="12" fill="currentColor" />
      <rect x="-6" y="-6" width="12" height="12" fill="currentColor" transform="rotate(45)" />
      <circle r="2.6" fill="var(--color-cream)" opacity="0.85" />
    </svg>
  );
}

/** Crescent moon with a small star. */
export function Crescent({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d="M34 6a26 26 0 1 0 24 36A21 21 0 1 1 34 6z" fill="currentColor" />
      <g transform="translate(46 20) scale(0.55)">
        <rect x="-6" y="-6" width="12" height="12" fill="currentColor" />
        <rect x="-6" y="-6" width="12" height="12" fill="currentColor" transform="rotate(45)" />
      </g>
    </svg>
  );
}

/** Pointed Mughal arch, open at the bottom. viewBox 200x260. */
export const ARCH_PATH =
  "M4 260 V112 C4 70 38 50 68 36 C86 28 96 18 100 4 C104 18 114 28 132 36 C162 50 196 70 196 112 V260";
const ARCH_INNER =
  "M14 260 V114 C14 78 44 60 72 47 C88 40 96 31 100 20 C104 31 112 40 128 47 C156 60 186 78 186 114 V260";

/** Gold double outline of a Mughal arch. Stretches to its box. */
export function ArchFrame({ className = "", color = GOLD }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 260" preserveAspectRatio="none" className={className} aria-hidden>
      <path d={ARCH_PATH} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <path
        d={ARCH_INNER}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.7"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Hanging fanoos lantern with a warm glow. */
export function Lantern({
  className = "",
  chain = 40,
  style,
}: {
  className?: string;
  chain?: number;
  style?: CSSProperties;
}) {
  const id = useSvgId("lantern");
  const top = chain;
  return (
    <svg viewBox={`0 0 60 ${top + 92}`} className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id={`${id}-glass`} cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset="0.6" stopColor="#f3c86a" />
          <stop offset="1" stopColor="#d18a2c" />
        </radialGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <line x1="30" y1="0" x2="30" y2={top} stroke={GOLD} strokeWidth="1.2" />
      <circle className="animate-glow" cx="30" cy={top + 40} r="30" fill={`url(#${id}-halo)`} />
      <g transform={`translate(0 ${top})`}>
        <circle cx="30" cy="1" r="3" fill="none" stroke={GOLD} strokeWidth="1.5" />
        <path d="M24 4 H36 L42 14 H18 Z" fill={GOLD} />
        <path d="M30 0 C28 -2 32 -2 30 0" fill={GOLD} />
        <path d="M15 14 H45 L49 50 L40 68 H20 L11 50 Z" fill="#8a6a2a" />
        <path d="M19 18 H41 L44 50 L37 64 H23 L16 50 Z" fill={`url(#${id}-glass)`} />
        {/* Arched windows and ribs */}
        <g fill="none" stroke="#8a6a2a" strokeWidth="1.3">
          <path d="M30 18 V64 M23 18 L20 50 L23 64 M37 18 L40 50 L37 64" />
          <path d="M16.5 46 H43.5" />
          <path d="M21 44 V32 C21 28 23 26 25 24 C27 26 28 28 28 32 V44 M32 44 V32 C32 28 33 26 35 24 C37 26 39 28 39 32 V44" />
        </g>
        <path d="M20 68 H40 L35 78 H25 Z" fill={GOLD} />
        <circle cx="30" cy="82" r="3" fill={GOLD} />
        <path d="M30 85 C28 89 29 91 30 92 C31 91 32 89 30 85 Z" fill={GOLD} />
      </g>
    </svg>
  );
}

/** A gold coin-like seal with the couple's initials, used to open the doors. */
export function Medallion({ initials, className = "" }: { initials: [string, string]; className?: string }) {
  const id = useSvgId("medallion");
  const scallops = Array.from({ length: 24 }, (_, i) => (i * 360) / 24);
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden>
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fbe7a8" />
          <stop offset="0.55" stopColor="#d6ad55" />
          <stop offset="1" stopColor="#9a7230" />
        </radialGradient>
      </defs>
      {scallops.map((r) => (
        <circle key={r} cx="60" cy="8" r="6" fill={`url(#${id})`} transform={`rotate(${r} 60 60)`} />
      ))}
      <circle cx="60" cy="60" r="52" fill={`url(#${id})`} />
      <circle cx="60" cy="60" r="44" fill="#0f3d33" />
      <circle cx="60" cy="60" r="40" fill="none" stroke={GOLD_LIGHT} strokeWidth="1" strokeDasharray="2 3" />
      <path d="M57 26a7 7 0 1 0 8 9a5.5 5.5 0 1 1 -8 -9z" fill={GOLD_LIGHT} />
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fill={GOLD_LIGHT}
        fontSize="24"
        fontFamily="var(--f-display)"
        letterSpacing="1"
      >
        {initials[0]}
        <tspan fontSize="14" dx="3" dy="-3" fontFamily="var(--font-pinyon), cursive">
          &amp;
        </tspan>
        <tspan dx="3" dy="3">
          {initials[1]}
        </tspan>
      </text>
      <path d="M44 84 H76" stroke={GOLD_LIGHT} strokeWidth="1" />
    </svg>
  );
}

/** Strings of jasmine and roses hanging in scallops, like a doorway toran. */
export function FloralSwag({ className = "", scallops = 4 }: { className?: string; scallops?: number }) {
  const width = 400;
  const span = width / scallops;
  const beads: { x: number; y: number; rose: boolean }[] = [];
  for (let s = 0; s < scallops; s++) {
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      beads.push({ x: s * span + t * span, y: 6 + 26 * (1 - (2 * t - 1) ** 2), rose: i % 3 === 0 });
    }
  }
  return (
    <svg viewBox={`0 0 ${width} 60`} preserveAspectRatio="none" className={className} aria-hidden>
      {Array.from({ length: scallops + 1 }, (_, s) => (
        <g key={s}>
          <line x1={s * span} y1="4" x2={s * span} y2="46" stroke="#f7f1e1" strokeWidth="2" strokeDasharray="3 2.5" />
          <circle cx={s * span} cy="50" r="4" fill="#c0485a" />
          <circle cx={s * span} cy="4" r="4.5" fill={GOLD} />
        </g>
      ))}
      {beads.map(({ x, y, rose }, i) => (
        <circle key={i} cx={x} cy={y} r={rose ? 4 : 3} fill={rose ? "#b8344a" : "#fbf6e6"} />
      ))}
    </svg>
  );
}

/** Mughal skyline: a central onion dome, side domes and minarets. viewBox 400x130. */
export function Skyline({
  className = "",
  fill = "#0b2f28",
  line = GOLD,
}: {
  className?: string;
  fill?: string;
  line?: string;
}) {
  const minaret = (x: number) =>
    `M${x - 7} 130 V50 H${x + 7} V130 Z M${x - 9} 50 C${x - 9} 40 ${x} 36 ${x} 26 C${x} 36 ${x + 9} 40 ${x + 9} 50 Z`;
  const dome = (x: number, w: number, base: number, h: number) =>
    `M${x - w} 130 V${base} C${x - w} ${base - h * 0.5} ${x - w * 0.4} ${base - h * 0.75} ${x} ${base - h} C${x + w * 0.4} ${base - h * 0.75} ${x + w} ${base - h * 0.5} ${x + w} ${base} V130 Z`;
  const shapes = [
    minaret(40),
    minaret(360),
    dome(105, 26, 96, 34),
    dome(295, 26, 96, 34),
    dome(200, 54, 80, 66),
    "M0 112 H400 V130 H0 Z",
    "M140 130 V96 H260 V130 Z",
  ];
  return (
    <svg viewBox="0 0 400 130" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden>
      <g fill={fill} stroke={line} strokeWidth="0.8" strokeOpacity="0.55">
        {shapes.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <line x1="200" y1="14" x2="200" y2="2" stroke={line} strokeWidth="1.2" />
      <path d="M198 4a3 3 0 1 0 4 3.5a2.3 2.3 0 1 1 -4 -3.5z" fill={line} />
      {[40, 360].map((x) => (
        <line key={x} x1={x} y1="26" x2={x} y2="18" stroke={line} strokeWidth="1" />
      ))}
      {/* Arched doorways */}
      <g fill="none" stroke={line} strokeOpacity="0.6" strokeWidth="0.8">
        <path d="M188 130 V112 C188 106 194 102 200 98 C206 102 212 106 212 112 V130" />
        <path d="M160 130 V116 C160 112 164 110 167 108 C170 110 174 112 174 116 V130" />
        <path d="M226 130 V116 C226 112 230 110 233 108 C236 110 240 112 240 116 V130" />
      </g>
    </svg>
  );
}

const PETAL = "M0 0 C-5 -3 -6 -10 0 -13 C6 -10 5 -3 0 0 Z";
const PETAL_COLORS = ["#a3243b", "#c0485a", "#d9707f", "#8c2f39", "#e9a3ad"];

/** Rose petals showering down the page. Positions are fixed so server and client agree. */
export function FallingPetals({ count = 14 }: { count?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const size = 10 + ((i * 5) % 8);
        const style = {
          left: `${(i * 37 + 7) % 100}%`,
          "--duration": `${13 + ((i * 7) % 9)}s`,
          "--delay": `${-((i * 2.3) % 20)}s`,
          "--drift": `${(i % 2 ? 1 : -1) * (40 + ((i * 13) % 80))}px`,
          "--spin": `${(i % 3 ? 1 : -1) * (220 + ((i * 41) % 280))}deg`,
        } as CSSProperties;
        return (
          <span key={i} className="animate-petal-fall absolute top-0" style={style}>
            <span className="animate-petal-flutter block" style={{ animationDelay: `${-i * 0.7}s` }}>
              <svg viewBox="-7 -14 14 14" width={size} height={size} style={{ opacity: 0.9 }}>
                <path d={PETAL} fill={PETAL_COLORS[i % PETAL_COLORS.length]} />
              </svg>
            </span>
          </span>
        );
      })}
    </div>
  );
}

// Couple palette
const SKIN_GROOM = "#cf9a74";
const SKIN_BRIDE = "#dba684";
const IVORY = "#f7ecd2";
const IVORY_SHADE = "#e9d8b1";
const MAROON = "#8c2f39";
const MAROON_DARK = "#6b2029";
const RED = "#a3243b";
const RED_DARK = "#7e1a2d";
const BORDER = "#d8b25f";

const LEHENGA_BUTI: [number, number][] = [
  [150, 170],
  [172, 162],
  [190, 176],
  [140, 205],
  [162, 196],
  [184, 206],
  [204, 200],
  [132, 240],
  [152, 232],
  [174, 238],
  [196, 232],
  [214, 244],
  [142, 268],
  [186, 266],
  [206, 270],
  [164, 270],
];

/**
 * The bride and groom, faceless in the traditional style: the groom in an ivory sherwani with
 * a maroon safa and a sehra of jasmine strands, the bride in a maroon lehenga under a dupatta.
 * viewBox 260x320.
 */
export function CoupleIllustration({ className = "" }: { className?: string }) {
  // Garland around the groom's neck.
  const garland = Array.from({ length: 15 }, (_, i) => {
    const t = i / 14;
    return { x: 79 + 32 * t, y: 98 + 52 * (1 - (2 * t - 1) ** 2), rose: i % 2 === 0 };
  });
  // Sehra strands hanging from the turban band over the face.
  const sehra = Array.from({ length: 9 }, (_, i) => 79 + i * 4);

  return (
    <svg viewBox="0 0 260 320" className={className} role="img" aria-label="">
      <ellipse cx="135" cy="304" rx="104" ry="9" fill="#000" opacity="0.12" />

      {/* ---------- Bride ---------- */}
      {/* Dupatta falling behind */}
      <path d="M152 76 C140 120 132 180 126 252 L144 254 C150 190 156 130 162 96 Z" fill="#c23a52" opacity="0.8" />
      {/* Lehenga */}
      <path d="M153 138 H189 C201 180 214 240 227 300 H113 C126 240 140 180 153 138 Z" fill={RED} />
      <g stroke={RED_DARK} strokeWidth="1" opacity="0.55" fill="none">
        <path d="M160 142 L140 286 M170 142 L166 286 M180 142 L194 286 M186 142 L214 286" />
      </g>
      {LEHENGA_BUTI.map(([x, y]) => (
        <g key={`${x}-${y}`} fill={BORDER}>
          <circle cx={x} cy={y} r="1.8" />
          <circle cx={x} cy={y - 3.4} r="0.9" />
        </g>
      ))}
      <path d="M116 284 H224 L227 300 H113 Z" fill={BORDER} />
      <path d="M117 279 H223" stroke={BORDER} strokeWidth="1.5" />
      <g fill={RED_DARK}>
        {Array.from({ length: 13 }, (_, i) => (
          <circle key={i} cx={120 + i * 8.3} cy="292" r="1.6" />
        ))}
      </g>
      {/* Choli and kamarbandh */}
      <path d="M150 105 C158 98 182 98 190 105 L189 140 H151 Z" fill={RED} />
      <path d="M151 136 H189 V142 H151 Z" fill={BORDER} />
      {/* Right arm hanging, holding the dupatta */}
      <path d="M188 104 C196 124 199 150 197 180 L188 181 C188 154 186 130 182 112 Z" fill={RED} />
      <path d="M187.5 176 H197.3 V181 H187.5 Z" fill={BORDER} />
      <circle cx="192.5" cy="186" r="5.5" fill={SKIN_BRIDE} />
      {/* Left arm reaching to the groom's hand */}
      <path d="M153 104 C146 120 143 140 145 158 L153 160 C152 142 154 126 158 112 Z" fill={RED} />
      <path d="M144.6 154 H153.3 V159 H144.6 Z" fill={BORDER} />
      <circle cx="148" cy="164" r="5.5" fill={SKIN_BRIDE} />
      <g fill={MAROON_DARK} opacity="0.6">
        <circle cx="146.5" cy="163" r="0.8" />
        <circle cx="149.5" cy="165.5" r="0.8" />
        <circle cx="191" cy="186.5" r="0.8" />
        <circle cx="194" cy="184.5" r="0.8" />
      </g>
      {/* Neck, head, jewellery */}
      <rect x="165" y="88" width="10" height="12" fill={SKIN_BRIDE} />
      <circle cx="170" cy="78" r="15.5" fill={SKIN_BRIDE} />
      <path d="M160 99 Q170 113 180 99" fill="none" stroke={BORDER} strokeWidth="3" />
      <circle cx="170" cy="108" r="2.6" fill={BORDER} />
      <circle cx="155.5" cy="87" r="2" fill={BORDER} />
      <circle cx="184.5" cy="87" r="2" fill={BORDER} />
      {/* Dupatta over the head, with a gold edge framing the face */}
      <path
        d="M152 82 C150 60 160 51 170 51 C180 51 190 60 188 82 C185 69 178 63 170 63 C162 63 155 69 152 82 Z"
        fill="#c23a52"
      />
      <path d="M152 82 C155 69 162 63 170 63 C178 63 185 69 188 82" fill="none" stroke={BORDER} strokeWidth="1.6" />
      <line x1="170" y1="63" x2="170" y2="66" stroke={BORDER} strokeWidth="1" />
      <circle cx="170" cy="68" r="2.4" fill={BORDER} />
      {/* Dupatta falling over the right shoulder and arm */}
      <path d="M187 74 C198 116 208 172 214 246 L198 248 C194 186 189 132 182 96 Z" fill="#d0566b" opacity="0.55" />
      <path d="M214 246 L198 248" stroke={BORDER} strokeWidth="2" />

      {/* ---------- Groom ---------- */}
      {/* Turban tail */}
      <path d="M111 58 C122 66 125 84 119 100 L114 98 C118 84 116 70 109 62 Z" fill={MAROON_DARK} />
      {/* Churidar and mojari */}
      <rect x="80" y="258" width="13" height="40" fill={IVORY_SHADE} />
      <rect x="98" y="258" width="13" height="40" fill={IVORY_SHADE} />
      <path d="M78 296 H95 V302 H72 C72 298 75 296 78 296 Z" fill={BORDER} />
      <path d="M96 296 H113 C116 296 119 298 119 302 H96 Z" fill={BORDER} />
      {/* Sherwani */}
      <path d="M66 100 C74 92 84 90 95 90 C106 90 116 92 124 100 L130 170 L136 262 H54 L60 170 Z" fill={IVORY} />
      <path d="M95 92 L95 262 L136 262 L130 170 L124 100 C116 92 106 90 95 90 Z" fill={IVORY_SHADE} opacity="0.45" />
      <path d="M55 254 H135 L136 262 H54 Z" fill={BORDER} />
      <line x1="95" y1="94" x2="95" y2="262" stroke={BORDER} strokeWidth="1.4" />
      {[106, 118, 130, 142, 154, 166, 178].map((y) => (
        <circle key={y} cx="95" cy={y} r="1.7" fill={BORDER} />
      ))}
      <g fill={BORDER} opacity="0.8">
        {[
          [72, 200],
          [82, 220],
          [70, 236],
          [118, 206],
          [110, 226],
          [122, 240],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />
        ))}
      </g>
      {/* Stole over the left shoulder */}
      <path d="M71 97 C75 130 77 170 75 236 L85 236 C87 170 85 130 81 95 Z" fill={MAROON} />
      <path d="M75 236 H85" stroke={BORDER} strokeWidth="2.5" />
      {/* Arms */}
      <path d="M66 100 C58 120 54 150 56 186 L66 186 C66 156 70 128 74 110 Z" fill={IVORY} />
      <path d="M55.8 181 H66 V186 H55.8 Z" fill={BORDER} />
      <circle cx="61" cy="191" r="6" fill={SKIN_GROOM} />
      <path d="M124 100 C133 118 138 138 139 156 L130 158 C129 142 124 124 118 110 Z" fill={IVORY_SHADE} />
      <path d="M129.8 153 H139 V158 H129.8 Z" fill={BORDER} />
      <circle cx="139" cy="163" r="6" fill={SKIN_GROOM} />
      {/* Neck, collar, head */}
      <rect x="89" y="82" width="12" height="11" fill={SKIN_GROOM} />
      <path d="M86 90 Q95 96 104 90 L104 96 Q95 101 86 96 Z" fill={BORDER} />
      <circle cx="95" cy="70" r="17" fill={SKIN_GROOM} />
      {/* Garland */}
      {garland.map(({ x, y, rose }, i) => (
        <circle key={i} cx={x} cy={y} r={rose ? 3.6 : 3} fill={rose ? "#b8344a" : "#fbf6e6"} />
      ))}
      {/* Safa */}
      <path d="M76 66 C73 44 88 34 97 35 C110 35 119 48 114 66 C104 59 86 59 76 66 Z" fill={MAROON} />
      <g fill="none" stroke={MAROON_DARK} strokeWidth="1.3" opacity="0.8">
        <path d="M79 56 C88 46 100 42 111 46" />
        <path d="M77 61 C90 52 104 50 114 56" />
      </g>
      <path d="M76 66 C86 58 104 58 114 66 L114 61 C104 54 86 54 76 61 Z" fill={BORDER} />
      {/* Kalgi */}
      <path d="M95 50 C92 41 96 32 102 27 C100 36 99 43 97 50 Z" fill="#fbf6e6" />
      <circle cx="95.5" cy="52" r="3.6" fill={BORDER} />
      <circle cx="95.5" cy="52" r="1.4" fill="#b8344a" />
      {/* Sehra */}
      {sehra.map((x, i) => (
        <g key={x}>
          <line
            x1={x}
            y1="64"
            x2={x}
            y2={92 + (i % 2) * 3}
            stroke="#fffaf0"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="2.4 1.6"
          />
          <circle cx={x} cy={94 + (i % 2) * 3} r="1.5" fill={i % 2 ? GOLD : "#b8344a"} />
        </g>
      ))}
    </svg>
  );
}
