"use client";

import { CalendarDays } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { zonedToEpoch } from "@/lib/dates";
import { useI18n } from "@/lib/i18n";

type Props = {
  title: string;
  date: string;
  time: string;
  timezone: string;
  durationHours: number;
  location?: string;
  details?: string;
};

/** 20270131T050000Z */
function stamp(ms: number) {
  return new Date(ms)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function links({ title, date, time, timezone, durationHours, location = "", details = "" }: Props) {
  const start = zonedToEpoch(date, time, timezone);
  const end = start + durationHours * 3_600_000;
  const google = new URL("https://calendar.google.com/calendar/render");
  google.search = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details,
    location,
  }).toString();
  const outlook = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  outlook.search = new URLSearchParams({
    subject: title,
    startdt: new Date(start).toISOString(),
    enddt: new Date(end).toISOString(),
    body: details,
    location,
    path: "/calendar/action/compose",
    rru: "addevent",
  }).toString();
  const esc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//wedding-invite//EN",
    "BEGIN:VEVENT",
    `UID:${start}-${title.replace(/\W+/g, "")}@invite`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return { google: google.toString(), outlook: outlook.toString(), ics };
}

export function SaveTheDate(props: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  function downloadIcs() {
    const blob = new Blob([links(props).ics], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${props.title.replace(/[^\w]+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
    setOpen(false);
  }

  const item = "block w-full px-4 py-2.5 text-start text-sm text-foreground transition hover:bg-field";

  return (
    <div ref={ref} className="relative mt-8 inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-2 border border-gold/70 px-6 py-3 font-display text-xs uppercase tracking-[0.2em] text-gold-light transition hover:bg-gold/10"
      >
        <CalendarDays className="size-4" />
        {t.saveTheDate}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 z-30 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-field-border bg-cream py-1 shadow-xl"
          >
            <a role="menuitem" className={item} href={links(props).google} target="_blank" rel="noreferrer">
              {t.googleCalendar}
            </a>
            <a role="menuitem" className={item} href={links(props).outlook} target="_blank" rel="noreferrer">
              {t.outlook}
            </a>
            <button role="menuitem" type="button" className={item} onClick={downloadIcs}>
              {t.appleCalendar}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
