import Link from "next/link";
import { CalendarDays, List } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { PropertiesCalendar } from "@/components/calendar/properties-calendar";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { addDays, startOfDay } from "@/lib/calendar-utils";
import { BookingStatus } from "@/generated/prisma/client";

export default async function CalendarPage() {
  const user = await getCurrentDbUser();
  const rangeStart = addDays(startOfDay(new Date()), -14);
  const rangeEnd = addDays(startOfDay(new Date()), 60);

  const properties = await db.property.findMany({
    where: { ownerId: user?.id ?? "" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      city: true,
      source: true,
      bookings: {
        where: {
          status: { not: BookingStatus.CANCELLED },
          checkOut: { gt: rangeStart },
          checkIn: { lt: rangeEnd },
        },
        orderBy: { checkIn: "asc" },
        select: {
          id: true,
          guestName: true,
          checkIn: true,
          checkOut: true,
          status: true,
          platform: true,
          totalAmount: true,
          currency: true,
        },
      },
    },
  });

  const calendarData = properties.map((p) => ({
    id: p.id,
    name: p.name,
    city: p.city,
    source: p.source,
    bookings: p.bookings.map((b) => ({
      id: b.id,
      guestName: b.guestName,
      checkIn: b.checkIn.toISOString(),
      checkOut: b.checkOut.toISOString(),
      status: b.status,
      platform: b.platform,
      totalAmount: b.totalAmount,
      currency: b.currency,
    })),
  }));

  return (
    <>
      <DashboardHeader
        title="Calendar"
        description="Multi-listing timeline — all properties and stays at a glance"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/bookings">
                <List className="h-4 w-4" />
                Bookings list
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/bookings/new">
                <CalendarDays className="h-4 w-4" />
                New booking
              </Link>
            </Button>
          </div>
        }
      />
      <div className="p-6 lg:p-8">
        {calendarData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-6 py-16 text-center">
            <p className="text-neutral-500">
              Add or import properties to see your availability calendar.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/properties">Go to properties</Link>
            </Button>
          </div>
        ) : (
          <PropertiesCalendar properties={calendarData} />
        )}
      </div>
    </>
  );
}
