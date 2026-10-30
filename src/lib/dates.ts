// Dates in the JSON are wall-clock values in the event's timezone. These helpers
// format them without letting the viewer's own timezone shift the day.

function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
}

function utcDate(date: string) {
  const { y, m, d } = parts(date);
  return new Date(Date.UTC(y, m - 1, d));
}

/** "Sunday, Jan 31, 2027" / "الأحد، ٣١ يناير ٢٠٢٧" */
export function formatLongDate(date: string, locale = "en-US"): string {
  return utcDate(date).toLocaleDateString(locale, {
    weekday: "long",
    month: locale.startsWith("ar") ? "long" : "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "January 31, 2027" */
export function formatFullDate(date: string, locale = "en-US"): string {
  return utcDate(date).toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "December 2026" / "ديسمبر ٢٠٢٦" */
export function formatMonthYear(date: string, locale = "en-US"): string {
  return utcDate(date).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "Sunday" */
export function formatWeekday(date: string, locale = "en-US"): string {
  return utcDate(date).toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" });
}

/** "18:30" -> "6:30 PM" / "٦:٣٠ م" */
export function formatTime(time: string, locale = "en-US"): string {
  const [h, m] = time.split(":").map(Number);
  return new Date(Date.UTC(2000, 0, 1, h, m)).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

/** Two-digit number in the locale's digits: 7 -> "07" / "٠٧" */
export function formatNumber(n: number, locale = "en-US", minDigits = 1): string {
  return n.toLocaleString(locale, { minimumIntegerDigits: minDigits, useGrouping: false });
}

/** How far `tz` is ahead of UTC at instant `ts`, in ms. */
function tzOffset(ts: number, tz: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const get = (type: string) => Number(fmt.formatToParts(new Date(ts)).find((p) => p.type === type)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - ts;
}

/** Wall-clock date + time in `tz` -> epoch ms. */
export function zonedToEpoch(date: string, time: string, tz: string): number {
  const { y, m, d } = parts(date);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = guess - tzOffset(guess, tz);
  // Second pass corrects for a DST change between the guess and the real instant.
  return guess - tzOffset(first, tz);
}

/** Groups schedule items by their date, keeping the original order. */
export function groupByDate<T extends { dateTime: string }>(items: T[]): { date: string; items: T[] }[] {
  const groups: { date: string; items: T[] }[] = [];
  for (const item of items) {
    const date = item.dateTime.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last?.date === date) last.items.push(item);
    else groups.push({ date, items: [item] });
  }
  return groups;
}
