"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  addDays,
  buildDayRange,
  CALENDAR_CELL_PX,
  CALENDAR_DAY_COUNT,
  CALENDAR_PROPERTY_COL_PX,
  formatDayHeader,
  formatDayNumber,
  formatMonthYear,
  getBookingSpan,
  isSameDay,
  startOfDay,
  toDateInputValue,
} from "@/lib/calendar-utils";
import { chartColorForSource } from "@/lib/chart-colors";
import { formatMoney, platformLabel } from "@/lib/display";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Search,
} from "lucide-react";

export type CalendarBooking = {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  platform: string | null;
  totalAmount: number | null;
  currency: string;
};

export type CalendarProperty = {
  id: string;
  name: string;
  city: string | null;
  source: string;
  bookings: CalendarBooking[];
};

const STATUS_STYLES: Record<string, string> = {
  UPCOMING: "ring-2 ring-white/40",
  CHECKED_IN: "ring-2 ring-emerald-300",
  CHECKED_OUT: "opacity-75",
  CANCELLED: "opacity-40 line-through",
};

const PLATFORM_FILTERS = [
  { id: "all", label: "All platforms" },
  { id: "airbnb", label: "Airbnb" },
  { id: "hostaway", label: "Hostaway" },
  { id: "booking_com", label: "Booking.com" },
  { id: "vrbo", label: "Vrbo" },
  { id: "manual", label: "Manual" },
  { id: "direct", label: "Direct" },
] as const;

export function PropertiesCalendar({ properties }: { properties: CalendarProperty[] }) {
  const [viewStart, setViewStart] = useState(() => {
    const today = startOfDay(new Date());
    return addDays(today, -3);
  });
  const [platformFilter, setPlatformFilter] = useState("all");
  const [search, setSearch] = useState("");

  const days = useMemo(
    () => buildDayRange(viewStart, CALENDAR_DAY_COUNT),
    [viewStart]
  );
  const viewEnd = days[days.length - 1];
  const today = startOfDay(new Date());

  const filteredProperties = useMemo(() => {
    let list = properties;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.city?.toLowerCase().includes(q) ?? false)
      );
    }
    return list.map((p) => ({
      ...p,
      bookings: p.bookings.filter((b) => {
        if (platformFilter !== "all" && (b.platform ?? "direct") !== platformFilter) {
          return false;
        }
        return (
          getBookingSpan(
            new Date(b.checkIn),
            new Date(b.checkOut),
            viewStart,
            viewEnd
          ) !== null
        );
      }),
    }));
  }, [properties, search, platformFilter, viewStart, viewEnd]);

  const stats = useMemo(() => {
    let bookingsInView = 0;
    let checkInsToday = 0;
    for (const p of properties) {
      for (const b of p.bookings) {
        const span = getBookingSpan(
          new Date(b.checkIn),
          new Date(b.checkOut),
          viewStart,
          viewEnd
        );
        if (!span) continue;
        if (platformFilter !== "all" && (b.platform ?? "direct") !== platformFilter) {
          continue;
        }
        bookingsInView++;
        if (isSameDay(new Date(b.checkIn), today)) checkInsToday++;
      }
    }
    return { bookingsInView, checkInsToday };
  }, [properties, viewStart, viewEnd, platformFilter, today]);

  const gridWidth = CALENDAR_DAY_COUNT * CALENDAR_CELL_PX;

  function goToday() {
    setViewStart(addDays(today, -3));
  }

  function shiftWeeks(delta: number) {
    setViewStart((s) => addDays(s, delta * 7));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => shiftWeeks(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => shiftWeeks(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="px-2 text-sm font-medium text-neutral-700">
            {formatMonthYear(viewStart)} – {formatMonthYear(viewEnd)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{properties.length} listings</Badge>
          <Badge variant="secondary">{stats.bookingsInView} stays in view</Badge>
          {stats.checkInsToday > 0 && (
            <Badge variant="accent">{stats.checkInsToday} check-in today</Badge>
          )}
          <Button size="sm" asChild>
            <Link href="/dashboard/bookings/new">
              <Plus className="h-4 w-4" />
              New booking
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            placeholder="Search listings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORM_FILTERS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={platformFilter === f.id ? "default" : "outline"}
              onClick={() => setPlatformFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-xs text-neutral-500">
        Tap a stay to open the guest stay page · Click an empty day to add a booking · Scroll
        horizontally on smaller screens
      </p>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div style={{ minWidth: CALENDAR_PROPERTY_COL_PX + gridWidth }}>
            <div className="flex border-b border-neutral-200 bg-neutral-50">
              <div
                className="sticky left-0 z-20 shrink-0 border-r border-neutral-200 bg-neutral-50 px-4 py-3"
                style={{ width: CALENDAR_PROPERTY_COL_PX }}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Property
                </span>
              </div>
              <div className="flex" style={{ width: gridWidth }}>
                {days.map((day) => {
                  const isToday = isSameDay(day, today);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "shrink-0 border-r border-neutral-100 px-1 py-2 text-center",
                        isToday && "bg-amber-50",
                        isWeekend && !isToday && "bg-neutral-50/80"
                      )}
                      style={{ width: CALENDAR_CELL_PX }}
                    >
                      <p
                        className={cn(
                          "text-[10px] font-medium uppercase",
                          isToday ? "text-amber-700" : "text-neutral-400"
                        )}
                      >
                        {formatDayHeader(day)}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isToday ? "text-amber-900" : "text-neutral-800"
                        )}
                      >
                        {formatDayNumber(day)}
                      </p>
                      {isToday && (
                        <div className="mx-auto mt-0.5 h-1 w-1 rounded-full bg-amber-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-neutral-500">
                No listings match your filters.
              </div>
            ) : (
              filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex border-b border-neutral-100 last:border-b-0"
                >
                  <div
                    className="sticky left-0 z-10 shrink-0 border-r border-neutral-200 bg-white px-4 py-3"
                    style={{ width: CALENDAR_PROPERTY_COL_PX }}
                  >
                    <Link
                      href={`/dashboard/properties/${property.id}`}
                      className="block hover:text-amber-800"
                    >
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {property.name}
                      </p>
                      {property.city && (
                        <p className="truncate text-xs text-neutral-500">{property.city}</p>
                      )}
                    </Link>
                  </div>
                  <div
                    className="relative shrink-0"
                    style={{ width: gridWidth, height: 72 }}
                  >
                    <div className="absolute inset-0 flex">
                      {days.map((day, i) => {
                        const isToday = isSameDay(day, today);
                        return (
                          <Link
                            key={day.toISOString()}
                            href={`/dashboard/bookings/new?propertyId=${property.id}&checkIn=${toDateInputValue(day)}`}
                            className={cn(
                              "shrink-0 border-r border-neutral-50 transition-colors hover:bg-amber-50/60",
                              isToday && "bg-amber-50/30"
                            )}
                            style={{ width: CALENDAR_CELL_PX }}
                            title={`Add booking · ${property.name}`}
                            aria-label={`Add booking on ${toDateInputValue(day)}`}
                          />
                        );
                      })}
                    </div>

                    {property.bookings.map((booking) => {
                      const span = getBookingSpan(
                        new Date(booking.checkIn),
                        new Date(booking.checkOut),
                        viewStart,
                        viewEnd
                      );
                      if (!span) return null;
                      const color = chartColorForSource(booking.platform ?? "direct");
                      const left = span.startOffset * CALENDAR_CELL_PX + 4;
                      const width = span.span * CALENDAR_CELL_PX - 8;

                      return (
                        <Link
                          key={booking.id}
                          href={`/stay/${booking.id}`}
                          target="_blank"
                          className={cn(
                            "absolute top-2 z-[5] flex h-14 items-center gap-2 overflow-hidden rounded-lg px-2 text-white shadow-md transition-transform hover:z-10 hover:scale-[1.02]",
                            STATUS_STYLES[booking.status] ?? ""
                          )}
                          style={{
                            left,
                            width: Math.max(width, 48),
                            backgroundColor: color,
                          }}
                          title={`${booking.guestName} · ${platformLabel(booking.platform)} · ${booking.status}`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                            {getInitials(booking.guestName)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold">
                              {booking.guestName}
                            </span>
                            <span className="block truncate text-[10px] opacity-90">
                              {platformLabel(booking.platform)}
                              {booking.totalAmount != null && booking.totalAmount > 0
                                ? ` · ${formatMoney(booking.totalAmount, booking.currency)}`
                                : ""}
                            </span>
                          </span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
        {PLATFORM_FILTERS.filter((f) => f.id !== "all").map((f) => (
          <span key={f.id} className="inline-flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: chartColorForSource(f.id) }}
            />
            {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}
