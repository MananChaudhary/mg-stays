import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PropertySourceBadge } from "@/components/properties/property-source-badge";
import { getCurrentDbUser } from "@/lib/auth";
import { formatMoney } from "@/lib/dashboard-stats";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function BookingsPage() {
  const user = await getCurrentDbUser();
  const bookings = await db.booking.findMany({
    where: { property: { ownerId: user?.id ?? "" } },
    include: { property: true },
    orderBy: { checkIn: "desc" },
  });

  return (
    <>
      <DashboardHeader
        title="Bookings"
        description="Manage guest stays and generate stay pages"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/calendar">
                <CalendarDays className="h-4 w-4" />
                Calendar view
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/bookings/new">
                <Plus className="h-4 w-4" />
                New booking
              </Link>
            </Button>
          </div>
        }
      />
      <div className="p-8">
        <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-neutral-500">Guest</th>
                <th className="px-6 py-3 text-left font-medium text-neutral-500">Property</th>
                <th className="px-6 py-3 text-left font-medium text-neutral-500">Platform</th>
                <th className="px-6 py-3 text-left font-medium text-neutral-500">Dates</th>
                <th className="px-6 py-3 text-left font-medium text-neutral-500">Amount</th>
                <th className="px-6 py-3 text-left font-medium text-neutral-500">Status</th>
                <th className="px-6 py-3 text-left font-medium text-neutral-500">Stay page</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                    No bookings yet
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-neutral-50">
                    <td className="px-6 py-4 font-medium">{b.guestName}</td>
                    <td className="px-6 py-4 text-neutral-600">{b.property.name}</td>
                    <td className="px-6 py-4">
                      <PropertySourceBadge source={b.platform ?? "direct"} />
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-700">
                      {b.totalAmount != null && b.totalAmount > 0
                        ? formatMoney(b.totalAmount, b.currency)
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{b.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/stay/${b.id}`}
                        target="_blank"
                        className="text-amber-700 hover:underline"
                      >
                        Open stay page →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
