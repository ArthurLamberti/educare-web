/**
 * Lesson times are UTC instants in the API and are always shown and entered in the school's time
 * zone, never the browser's or the server's. Uses Intl only (no Temporal in Node 22).
 */

export type ZonedParts = {
  /** yyyy-MM-dd */
  date: string;
  /** HH:mm (24h) */
  time: string;
};

const partsFormatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(zone: string) {
  let formatter = partsFormatters.get(zone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    partsFormatters.set(zone, formatter);
  }
  return formatter;
}

function wallClock(epochMs: number, zone: string) {
  const parts = Object.fromEntries(partsFormatter(zone).formatToParts(new Date(epochMs)).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** Offset of `zone` from UTC at the given instant, in ms (e.g. -3h for São Paulo). */
function zoneOffset(epochMs: number, zone: string) {
  const w = wallClock(epochMs, zone);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
  return asUtc - Math.floor(epochMs / 1000) * 1000;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The date and time an instant shows on a wall clock in `zone`. */
export function instantToZonedParts(instant: string | Date, zone: string): ZonedParts {
  const w = wallClock(new Date(instant).getTime(), zone);
  return { date: `${w.year}-${pad(w.month)}-${pad(w.day)}`, time: `${pad(w.hour)}:${pad(w.minute)}` };
}

/**
 * The instant at which the wall clock in `zone` shows `date` `time`. Returns null for invalid input
 * and for times that do not exist in the zone (skipped by a DST change).
 */
export function zonedDateTimeToInstant(date: string, time: string, zone: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t) return null;
  const guess = Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(t[1]), Number(t[2]));
  if (Number.isNaN(guess)) return null;
  // Apply the offset, then re-check it at the result in case a DST change lies in between.
  let result = guess - zoneOffset(guess, zone);
  result = guess - zoneOffset(result, zone);
  const back = instantToZonedParts(new Date(result), zone);
  return back.date === date && back.time === time ? new Date(result) : null;
}

/** e.g. "14:00". */
export function formatTime(instant: string, zone: string) {
  return instantToZonedParts(instant, zone).time;
}

/** e.g. "ter., 17 de nov. de 2026". */
export function formatDay(instant: string, zone: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: zone, weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(
    new Date(instant),
  );
}

/** e.g. "ter., 17 de nov. de 2026, 14:00". */
export function formatDateTime(instant: string, zone: string) {
  return `${formatDay(instant, zone)}, às ${formatTime(instant, zone)}`;
}
