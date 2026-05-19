import Link from "next/link";
import {
  Building2,
  Calendar,
  DollarSign,
  MessageSquare,
  Plus,
  TrendingUp,
  Bot,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertySourceBadge } from "@/components/properties/property-source-badge";
import { DashboardPieChart } from "@/components/dashboard/dashboard-pie-chart";
import { chartColorForSource } from "@/lib/chart-colors";
import { formatMoney, type DashboardStats } from "@/lib/dashboard-stats";
import { formatDate, formatDateTime } from "@/lib/utils";

export function DashboardAnalytics({
  stats,
  isOwner = false,
}: {
  stats: DashboardStats;
  isOwner?: boolean;
}) {
  const propertyPieSlices = stats.sourceBreakdown.map((row) => ({
    id: row.source,
    label: row.label,
    value: row.count,
    color: chartColorForSource(row.source),
  }));

  const earningsPieSlices = stats.platformEarnings.map((row) => ({
    id: row.platform,
    label: row.label,
    value: row.amount,
    color: chartColorForSource(row.platform),
    displayValue: formatMoney(row.amount),
  }));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Properties"
          value={stats.propertyCount}
          icon={Building2}
          change={`${stats.connectedPlatforms} platform(s) connected`}
          trend="up"
        />
        <StatCard
          title="Total bookings"
          value={stats.totalBookings}
          icon={Calendar}
          change={`${stats.newBookings7d} new this week`}
          trend={stats.newBookings7d > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Earnings (completed)"
          value={formatMoney(stats.totalEarnings)}
          icon={DollarSign}
          change={`${formatMoney(stats.projectedEarnings)} projected`}
          trend="up"
        />
        <StatCard
          title="Active stays"
          value={stats.upcomingCount}
          icon={TrendingUp}
          change={`${stats.checkedInCount} checked in now`}
          trend="neutral"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Guest messages"
          value={stats.openConversations}
          icon={MessageSquare}
          change="Open conversations"
        />
        <StatCard
          title="AI responses (24h)"
          value={stats.aiLogs24h}
          icon={Bot}
          change="Automated replies"
          trend="up"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="font-semibold">Properties by source</h2>
          <p className="mt-1 text-sm text-neutral-500">
            From manual entry and platform sync
          </p>
          <div className="mt-6">
            <DashboardPieChart
              slices={propertyPieSlices}
              emptyMessage="No properties yet."
              centerLabel={String(stats.propertyCount)}
            />
          </div>
          <Button variant="outline" size="sm" className="mt-6 w-full" asChild>
            <Link href="/dashboard/properties">View all properties</Link>
          </Button>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="font-semibold">Earnings by platform</h2>
          <p className="mt-1 text-sm text-neutral-500">Completed stays only (demo data)</p>
          <div className="mt-6">
            <DashboardPieChart
              slices={earningsPieSlices}
              emptyMessage="Sync a platform or add bookings with amounts to see revenue."
              centerLabel={formatMoney(stats.totalEarnings)}
            />
          </div>
          <p className="mt-4 text-xs text-neutral-400">
            Projected pipeline: {formatMoney(stats.projectedEarnings)}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="font-semibold">Recent activity</h2>
          <p className="mt-1 text-sm text-neutral-500">Imports, bookings & sync</p>
          <ul className="mt-6 space-y-3">
            {stats.recentActivity.length === 0 ? (
              <li className="text-sm text-neutral-500">No activity yet.</li>
            ) : (
              stats.recentActivity.map((item, i) => (
                <li
                  key={`${item.type}-${i}-${item.at.toISOString()}`}
                  className="rounded-xl border border-neutral-50 bg-neutral-50/80 px-3 py-2"
                >
                  <p className="text-sm font-medium text-neutral-900">{item.title}</p>
                  <p className="text-xs text-neutral-500">{item.subtitle}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    {formatDateTime(item.at)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Upcoming & active bookings</h2>
            <Link href="/dashboard/bookings" className="text-sm text-amber-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {stats.upcomingBookings.length === 0 ? (
              <p className="text-sm text-neutral-500">No upcoming bookings.</p>
            ) : (
              stats.upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{booking.guestName}</p>
                    <p className="truncate text-sm text-neutral-500">
                      {booking.property.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="secondary">{booking.status}</Badge>
                      <PropertySourceBadge source={booking.platform ?? "direct"} />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {booking.totalAmount != null && booking.totalAmount > 0 && (
                      <p className="font-semibold text-emerald-700">
                        {formatMoney(booking.totalAmount, booking.currency)}
                      </p>
                    )}
                    <p className="text-xs text-neutral-500">{formatDate(booking.checkIn)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Quick actions</h2>
          <p className="mt-1 text-sm text-neutral-500">Grow your portfolio</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/properties/new">
                <Plus className="h-4 w-4" />
                Add property
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/bookings/new">
                <Calendar className="h-4 w-4" />
                New booking
              </Link>
            </Button>
            {isOwner && (
              <Button asChild variant="outline" className="justify-start">
                <Link href="/dashboard/integrations">Sync Airbnb / Hostaway</Link>
              </Button>
            )}
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/messages">Open inbox</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
