import { BookingStatus } from "@/generated/prisma/client";
import { formatMoney, platformLabel } from "./display";
import { db } from "./db";

export type PlatformKey =
  | "airbnb"
  | "hostaway"
  | "booking_com"
  | "vrbo"
  | "manual"
  | "direct"
  | "preview"
  | string;

export { formatMoney, platformLabel };

export function bookingRevenue(booking: {
  totalAmount: number | null;
  checkIn: Date;
  checkOut: Date;
}) {
  if (booking.totalAmount != null && booking.totalAmount > 0) {
    return booking.totalAmount;
  }
  return 0;
}

export async function getDashboardStats(ownerId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    properties,
    allBookings,
    newBookings7d,
    integrations,
    recentProperties,
    aiLogs24h,
    openConversations,
  ] = await Promise.all([
    db.property.findMany({
      where: { ownerId },
      select: {
        id: true,
        name: true,
        source: true,
        createdAt: true,
        lastSyncedAt: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    db.booking.findMany({
      where: { property: { ownerId } },
      select: {
        id: true,
        guestName: true,
        checkIn: true,
        checkOut: true,
        status: true,
        platform: true,
        totalAmount: true,
        currency: true,
        createdAt: true,
        property: { select: { name: true, source: true } },
      },
      orderBy: { checkIn: "desc" },
    }),
    db.booking.count({
      where: {
        property: { ownerId },
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    db.platformIntegration.findMany({
      where: { ownerId, status: "CONNECTED" },
      select: { platform: true, lastSyncAt: true },
    }),
    db.property.findMany({
      where: { ownerId, lastSyncedAt: { not: null } },
      orderBy: { lastSyncedAt: "desc" },
      take: 5,
      select: { name: true, source: true, lastSyncedAt: true },
    }),
    db.aIActivityLog.count({
      where: {
        property: { ownerId },
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    }),
    db.conversation.count({
      where: { property: { ownerId }, isResolved: false },
    }),
  ]);

  const propertiesBySource: Record<string, number> = {};
  for (const p of properties) {
    const s = p.source || "manual";
    propertiesBySource[s] = (propertiesBySource[s] ?? 0) + 1;
  }

  const earningsByPlatform: Record<string, number> = {};
  let totalEarnings = 0;
  let projectedEarnings = 0;

  for (const b of allBookings) {
    const rev = bookingRevenue(b);
    const plat = b.platform || "direct";
    if (b.status === BookingStatus.CHECKED_OUT && rev > 0) {
      earningsByPlatform[plat] = (earningsByPlatform[plat] ?? 0) + rev;
      totalEarnings += rev;
    } else if (
      (b.status === BookingStatus.UPCOMING || b.status === BookingStatus.CHECKED_IN) &&
      rev > 0
    ) {
      projectedEarnings += rev;
    }
  }

  const upcomingBookings = allBookings.filter(
    (b) =>
      b.status === BookingStatus.UPCOMING ||
      b.status === BookingStatus.CHECKED_IN
  );

  const checkedInCount = allBookings.filter(
    (b) => b.status === BookingStatus.CHECKED_IN
  ).length;

  const platformEarnings = Object.entries(earningsByPlatform)
    .map(([platform, amount]) => ({
      platform,
      label: platformLabel(platform),
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const recentActivity: Array<{
    type: "property" | "booking" | "sync";
    title: string;
    subtitle: string;
    at: Date;
  }> = [];

  for (const p of recentProperties) {
    if (p.lastSyncedAt) {
      recentActivity.push({
        type: "sync",
        title: `Synced from ${platformLabel(p.source)}`,
        subtitle: p.name,
        at: p.lastSyncedAt,
      });
    }
  }

  for (const b of allBookings.slice(0, 8)) {
    recentActivity.push({
      type: "booking",
      title: `Booking · ${b.guestName}`,
      subtitle: `${b.property.name} via ${platformLabel(b.platform)}`,
      at: b.createdAt,
    });
  }

  recentActivity.sort((a, b) => b.at.getTime() - a.at.getTime());

  return {
    propertyCount: properties.length,
    propertiesBySource,
    totalBookings: allBookings.length,
    newBookings7d,
    upcomingCount: upcomingBookings.length,
    checkedInCount,
    totalEarnings,
    projectedEarnings,
    platformEarnings,
    connectedPlatforms: integrations.length,
    aiLogs24h,
    openConversations,
    upcomingBookings: upcomingBookings.slice(0, 5),
    recentActivity: recentActivity.slice(0, 8),
    sourceBreakdown: Object.entries(propertiesBySource).map(([source, count]) => ({
      source,
      label: platformLabel(source),
      count,
    })),
  };
}

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
