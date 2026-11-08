"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { DICTIONARIES, LOCALES, localize, type Lang } from "@/lib/i18n";
import type { Invitation } from "@/lib/invitation";

const LANG_PARAM = "lang";

// A shared link can pick the language and the guest group: /invite/zaid-aisha?for=family&lang=ar
const noSubscribe = () => () => {};
const param = (name: string) => () => new URLSearchParams(window.location.search).get(name);
const readLang = (): Lang | null => {
  const v = param(LANG_PARAM)();
  return v === "ar" || v === "en" ? v : null;
};
const readGroup = param("for");

/** Language and guest group for an invitation, shared by every template. */
export function useInvitation(base: Invitation) {
  const bilingual = Boolean(base.ar);
  // Language precedence: visitor's toggle, then ?lang= in the link, then the JSON default.
  const [chosen, setChosen] = useState<Lang | null>(null);
  const urlLang = useSyncExternalStore(noSubscribe, readLang, () => null);
  const group = useSyncExternalStore(noSubscribe, readGroup, () => null);
  const lang: Lang = bilingual ? (chosen ?? urlLang ?? base.defaultLanguage ?? "en") : "en";
  const i18n = useMemo(() => ({ lang, t: DICTIONARIES[lang], locale: LOCALES[lang] }), [lang]);
  const inv = useMemo(() => localize(base, lang), [base, lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function toggleLang() {
    const next: Lang = lang === "en" ? "ar" : "en";
    setChosen(next);
    const url = new URL(window.location.href);
    url.searchParams.set(LANG_PARAM, next);
    history.replaceState(history.state, "", url);
  }

  return { inv, i18n, lang, bilingual, group, toggleLang };
}
