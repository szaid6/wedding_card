// Used by client components only (React context).
import { createContext, useContext } from "react";
import type { InvitationData } from "./invitation";

export type Lang = "en" | "ar";

const en = {
  switchTo: "العربية",
  openInvitation: "Open the invitation",
  tapToOpen: "Tap to open",
  bismillahMeaning: "In the name of Allah, the Most Gracious, the Most Merciful",
  playMusic: "Play music",
  muteMusic: "Mute music",
  scroll: "Scroll",
  scratchTitle: "Scratch to Reveal",
  scratchHint: "Scratch the gold to reveal",
  scratchAria: "Scratch the golden arch to reveal the date",
  youreInvited: "You're Invited!",
  saveTheDate: "Save the Date",
  googleCalendar: "Google Calendar",
  outlook: "Outlook",
  appleCalendar: "Apple Calendar (.ics)",
  showPhoto: (n: number) => `Show photo ${n}`,
  countdownTitle: "Counting Down to Forever",
  units: ["Days", "Hours", "Minutes", "Seconds"],
  celebrationBegun: "The celebration has begun!",
  couple: "Bride & Groom",
  program: "Program Timeline",
  venue: "Venue",
  mapOf: (name: string) => `Map of ${name}`,
  viewOnMaps: "View on Google Maps",
  gifts: "Gifts",
  closing: "We can't wait to celebrate with you!",
  and: "&",
  joinNames: (a: string, b: string) => `${a} & ${b}`,
  weddingOf: (names: string) => `${names} - Wedding`,
  eventOf: (event: string, names: string) => `${event} - ${names}`,
  // Sea template
  invitesYou: "is delighted to invite you to the Nikah of their son",
  daughterWith: "with",
  addToCalendar: "Add to calendar",
  openInMaps: "Open in Maps",
  scrollEvening: "Scroll through the evening",
  daysToGo: (n: number) => (n === 1 ? "Tomorrow" : `In ${n} days`),
  sunset: "Sunset over the Arabian Sea",
  aboutSix: "About 6:00 PM",
  moonThatNight: "The moon that night",
  moonTonight: "The moon tonight",
  duas: "Duas",
};

export type Dictionary = typeof en;

const ar: Dictionary = {
  switchTo: "English",
  openInvitation: "افتح الدعوة",
  tapToOpen: "اضغط لفتح الدعوة",
  bismillahMeaning: "",
  playMusic: "تشغيل الموسيقى",
  muteMusic: "كتم الموسيقى",
  scroll: "مرّر",
  scratchTitle: "امسح لتكشف",
  scratchHint: "امسح الذهب لتكشف الموعد",
  scratchAria: "امسح القوس الذهبي لتكشف الموعد",
  youreInvited: "أنتم مدعوون!",
  saveTheDate: "احفظ الموعد",
  googleCalendar: "تقويم Google",
  outlook: "Outlook",
  appleCalendar: "تقويم Apple (.ics)",
  showPhoto: (n) => `عرض الصورة ${n}`,
  countdownTitle: "العد التنازلي ليومنا",
  units: ["أيام", "ساعات", "دقائق", "ثوانٍ"],
  celebrationBegun: "لقد بدأ الاحتفال!",
  couple: "العروسان",
  program: "برنامج الحفل",
  venue: "المكان",
  mapOf: (name) => `خريطة ${name}`,
  viewOnMaps: "عرض على خرائط Google",
  gifts: "الهدايا",
  closing: "بانتظاركم لنحتفل معاً!",
  and: "و",
  joinNames: (a, b) => `${a} و${b}`,
  weddingOf: (names) => `زفاف ${names}`,
  eventOf: (event, names) => `${event} - ${names}`,
  invitesYou: "يسرّها دعوتكم لحضور عقد قران ابنها",
  daughterWith: "على",
  addToCalendar: "أضف إلى التقويم",
  openInMaps: "افتح في الخرائط",
  scrollEvening: "مرّر عبر الأمسية",
  daysToGo: (n) => (n === 1 ? "غداً" : `بعد ${n} يوماً`),
  sunset: "غروب الشمس على بحر العرب",
  aboutSix: "نحو السادسة مساءً",
  moonThatNight: "القمر في تلك الليلة",
  moonTonight: "القمر الليلة",
  duas: "الدعاء",
};

export const DICTIONARIES: Record<Lang, Dictionary> = { en, ar };

/** Intl locale per language. Arabic uses Arabic-Indic digits (٣١). */
export const LOCALES: Record<Lang, string> = { en: "en-US", ar: "ar-u-nu-arab" };

export type I18n = { lang: Lang; t: Dictionary; locale: string };

export const I18nContext = createContext<I18n>({ lang: "en", t: en, locale: LOCALES.en });

export function useI18n() {
  return useContext(I18nContext);
}

// Headings fall back to the dictionary, never to the English JSON value, so a page in
// Arabic never mixes in English section titles the author didn't translate.
const LABEL_KEYS = new Set(["title", "revealLabel"]);

function merge(base: unknown, over: unknown, dropLabels: boolean): unknown {
  if (Array.isArray(base)) {
    const o = Array.isArray(over) ? over : [];
    return base.map((item, i) => merge(item, o[i], dropLabels));
  }
  if (base && typeof base === "object") {
    // A text section written as an object in English but as a plain string in Arabic.
    if (typeof over === "string" && "text" in base) over = { text: over };
    const o = over && typeof over === "object" ? (over as Record<string, unknown>) : {};
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(base)) {
      if (dropLabels && LABEL_KEYS.has(k) && o[k] === undefined) continue;
      out[k] = merge(v, o[k], dropLabels);
    }
    for (const [k, v] of Object.entries(o)) if (!(k in base)) out[k] = v;
    return out;
  }
  // Strings in the base can be replaced by a plain string, e.g. gifts: "..."
  return over ?? base;
}

/** The invitation as seen in `lang`: the `ar` block's text laid over the English content. */
export function localize<T extends InvitationData>(inv: T, lang: Lang): T {
  if (lang === "en" || !inv.ar) return inv;
  return merge(inv, inv.ar, true) as T;
}
