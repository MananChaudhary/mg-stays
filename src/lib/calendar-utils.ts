/** Calendar helpers — safe for server and client (no "use client") */

export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysBetween(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);
}

export function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function formatDayHeader(date: Date) {
  return new Intl.DateTimeFormat("en-AU", { weekday: "short" }).format(date);
}

export function formatDayNumber(date: Date) {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric" }).format(date);
}

export function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-AU", { month: "short", year: "2-digit" }).format(date);
}

export function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function buildDayRange(viewStart: Date, dayCount: number) {
  const start = startOfDay(viewStart);
  return Array.from({ length: dayCount }, (_, i) => addDays(start, i));
}

export type CalendarBookingSpan = {
  startOffset: number;
  span: number;
};

/** Night-based stay: check-in through night before check-out */
export function getBookingSpan(
  checkIn: Date,
  checkOut: Date,
  viewStart: Date,
  viewEnd: Date
): CalendarBookingSpan | null {
  const inDay = startOfDay(checkIn);
  const outDay = startOfDay(checkOut);
  const lastNight = addDays(outDay, -1);

  if (lastNight < viewStart || inDay > viewEnd) return null;

  const visibleStart = inDay < viewStart ? viewStart : inDay;
  const visibleEnd = lastNight > viewEnd ? viewEnd : lastNight;

  return {
    startOffset: daysBetween(viewStart, visibleStart),
    span: daysBetween(visibleStart, visibleEnd) + 1,
  };
}

export const CALENDAR_DAY_COUNT = 21;
export const CALENDAR_CELL_PX = 52;
export const CALENDAR_PROPERTY_COL_PX = 240;
