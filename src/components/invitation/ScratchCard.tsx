"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatFullDate, formatTime, formatWeekday } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";
import type { TemplateTheme } from "@/lib/templates";
import { Star8 } from "./Decor";

// Pointed Mughal arch (mehrab) in a 1x1 box: [startX, startY, ...cubic segments as 6-tuples].
// The straight sides are cubics with their control points on the line.
const START: [number, number] = [0.02, 1];
const CURVES: [number, number, number, number, number, number][] = [
  [0.02, 1, 0.02, 0.431, 0.02, 0.431],
  [0.02, 0.269, 0.19, 0.192, 0.34, 0.138],
  [0.43, 0.108, 0.48, 0.069, 0.5, 0.015],
  [0.52, 0.069, 0.57, 0.108, 0.66, 0.138],
  [0.81, 0.192, 0.98, 0.269, 0.98, 0.431],
  [0.98, 0.431, 0.98, 1, 0.98, 1],
];
const SVG_ARCH = `M${START.join(",")} ${CURVES.map((c) => `C${c.join(",")}`).join(" ")} Z`;
/** The inner gold border, inset from the outline. */
const INSET = { x: 0.07, y: 0.06, sx: 0.86, sy: 0.9 };

function archPath(w: number, h: number) {
  const p = new Path2D();
  p.moveTo(START[0] * w, START[1] * h);
  for (const [a, b, c, d, e, f] of CURVES) p.bezierCurveTo(a * w, b * h, c * w, d * h, e * w, f * h);
  p.closePath();
  return p;
}

const REVEAL_AT = 0.5;
const BRUSH = 34;

export function ScratchCard({
  theme,
  date,
  time,
  label,
  onReveal,
}: {
  theme: TemplateTheme;
  date: string;
  time: string;
  label: string;
  /** Fired once the foil has been scratched away. */
  onReveal?: () => void;
}) {
  const { t, locale } = useI18n();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) onReveal?.();
  }, [revealed, onReveal]);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const { width: w, height: h } = wrap.getBoundingClientRect();
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.clip(archPath(w, h));

    const [g0, g1, g2] = theme.scratch.gradient;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, g0);
    grad.addColorStop(0.5, g1);
    grad.addColorStop(1, g2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const shine = ctx.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.3, h * 0.25, w * 0.6);
    shine.addColorStop(0, "rgba(255,255,255,0.55)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, w, h);

    // Faint eight-point star lattice, like chased gold.
    ctx.strokeStyle = "rgba(125, 93, 36, 0.32)";
    ctx.lineWidth = 0.8;
    for (let y = 14; y < h; y += 26) {
      for (let x = (y / 26) % 2 ? 26 : 13; x < w; x += 26) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeRect(-4.5, -4.5, 9, 9);
        ctx.rotate(Math.PI / 4);
        ctx.strokeRect(-4.5, -4.5, 9, 9);
        ctx.restore();
      }
    }

    // Glitter
    const specks = Math.round((w * h) / 18);
    for (let i = 0; i < specks; i++) {
      const rgb = theme.scratch.speck[i % 3];
      ctx.fillStyle = `rgba(${rgb}, ${0.25 + Math.random() * 0.5})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.2, 1.2);
    }
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${theme.scratch.sparkle}, ${0.6 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.4 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Inner border following the arch.
    ctx.save();
    ctx.translate(w * INSET.x, h * INSET.y);
    ctx.scale(INSET.sx, INSET.sy);
    ctx.strokeStyle = "rgba(255, 246, 220, 0.85)";
    ctx.lineWidth = 1.6;
    ctx.stroke(archPath(w, h));
    ctx.restore();
    ctx.restore();
  }, [theme]);

  useEffect(() => {
    paint();
    // Repaint only on width changes; mobile URL-bar resizes would otherwise wipe progress.
    let lastWidth = wrapRef.current?.getBoundingClientRect().width;
    const ro = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width !== lastWidth) {
        lastWidth = entry.contentRect.width;
        paint();
      }
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [paint]);

  function point(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function scratch(to: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH;
    ctx.beginPath();
    const from = last.current ?? to;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x + 0.01, to.y);
    ctx.stroke();
    last.current = to;
  }

  function clearedRatio() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    const inside = archPath(canvas.width / dpr, canvas.height / dpr);
    const probe = document.createElement("canvas").getContext("2d")!;
    let total = 0;
    let clear = 0;
    const step = Math.max(4, Math.round(6 * dpr));
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        if (!probe.isPointInPath(inside, x / dpr, y / dpr)) continue;
        total++;
        if (data[(y * canvas.width + x) * 4 + 3] < 40) clear++;
      }
    }
    return total ? clear / total : 0;
  }

  function check() {
    if (!revealed && clearedRatio() >= REVEAL_AT) setRevealed(true);
  }

  return (
    <div className="flex flex-col items-center">
      <div
        ref={wrapRef}
        className="relative aspect-[200/260] w-[200px] drop-shadow-[0_12px_20px_rgba(90,60,20,0.35)]"
      >
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <radialGradient id="reveal-bg" cx="0.4" cy="0.3" r="0.8">
              <stop offset="0" stopColor={theme.colors.cream} />
              <stop offset="1" stopColor={theme.colors.field} />
            </radialGradient>
          </defs>
          <path d={SVG_ARCH} fill="url(#reveal-bg)" />
          <path
            d={SVG_ARCH}
            fill="none"
            stroke={theme.colors.gold}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            transform={`translate(${INSET.x} ${INSET.y}) scale(${INSET.sx} ${INSET.sy})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pt-14 text-center">
          <Star8 className="mb-2 size-4 text-gold" />
          <p className="mb-1 font-calligraphic text-xl italic text-primary">{label}</p>
          <p className="font-display text-base font-semibold text-foreground">{formatFullDate(date, locale)}</p>
          <p className="font-calligraphic text-sm text-primary">{formatWeekday(date, locale)}</p>
          <p className="mt-2 border-t border-gold/50 pt-2 font-display text-xs tracking-[0.2em] text-accent rtl:text-sm">
            {formatTime(time, locale)}
          </p>
        </div>

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 size-full cursor-grab touch-none transition-opacity duration-700 active:cursor-grabbing ${
            revealed ? "pointer-events-none opacity-0" : ""
          }`}
          aria-label={t.scratchAria}
          role="img"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawing.current = true;
            last.current = null;
            scratch(point(e));
          }}
          onPointerMove={(e) => {
            if (!drawing.current) return;
            scratch(point(e));
            if (++moves.current % 12 === 0) check();
          }}
          onPointerUp={() => {
            drawing.current = false;
            last.current = null;
            check();
          }}
          onPointerCancel={() => {
            drawing.current = false;
            last.current = null;
          }}
        />
        {revealed && <Confetti colors={theme.confetti} />}
      </div>
      {!revealed && (
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cream/60 rtl:text-sm">{t.scratchHint}</p>
      )}
    </div>
  );
}

function Confetti({ colors }: { colors: string[] }) {
  const [pieces] = useState(() =>
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 320,
      y: -Math.random() * 220 - 40,
      r: Math.random() * 540 - 270,
      color: colors[i % colors.length],
      w: 5 + Math.random() * 5,
    })),
  );
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.w, height: p.w * 0.6, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 260], opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: 2.2, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
