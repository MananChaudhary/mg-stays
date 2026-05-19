import {
  BookingStatus,
  IntegrationPlatform,
  IntegrationStatus,
  MessageStatus,
  NotificationType,
} from "@/generated/prisma/client";
import { db } from "../db";
import { airbnbConnectionKey } from "./airbnb/config";
import { syncAirbnbFromApi } from "./airbnb/sync-real";
import { getAirbnbIntegration } from "./airbnb/tokens";
import { PLATFORM_CONFIG } from "./platforms";
import { upsertImportedProperty } from "./sync-property";

function platformDisplayName(source: string) {
  const names: Record<string, string> = {
    airbnb: "Airbnb",
    hostaway: "Hostaway",
    booking_com: "Booking.com",
    vrbo: "Vrbo",
    whatsapp: "WhatsApp",
  };
  return names[source] ?? source;
}

async function ensureBookingAndMessages(
  propertyId: string,
  propertyName: string,
  externalListingId: string,
  platform: IntegrationPlatform,
  wifiName?: string,
  wifiPassword?: string
) {
  const config = PLATFORM_CONFIG[platform];
  let messageCount = 0;

  const bookingId = `sync-${externalListingId}-inbox`;
  const nights = 5;
  const nightly = 200;
  const booking = await db.booking.upsert({
    where: { id: bookingId },
    update: {
      propertyId,
      platform: config.source,
      platformRef: externalListingId,
    },
    create: {
      id: bookingId,
      propertyId,
      guestName: `${platformDisplayName(config.source)} Guest`,
      guestEmail: `guest+${externalListingId}@import.demo`,
      checkIn: new Date(),
      checkOut: new Date(Date.now() + nights * 24 * 60 * 60 * 1000),
      status: BookingStatus.UPCOMING,
      platform: config.source,
      platformRef: externalListingId,
      totalAmount: nights * nightly,
      currency: "AUD",
    },
  });

  const conversation = await db.conversation.upsert({
    where: { bookingId: booking.id },
    update: { propertyId },
    create: {
      propertyId,
      bookingId: booking.id,
      subject: `${platformDisplayName(config.source)} — ${propertyName}`,
    },
  });

  const existingMsg = await db.message.findFirst({
    where: { conversationId: conversation.id, channel: config.channel },
  });

  if (!existingMsg) {
    await db.message.create({
      data: {
        conversationId: conversation.id,
        content: `Hi! I have a reservation at ${propertyName} via ${platformDisplayName(config.source)}. What are the check-in details?`,
        isFromGuest: true,
        status: MessageStatus.SENT,
        channel: config.channel,
      },
    });
    await db.message.create({
      data: {
        conversationId: conversation.id,
        content: `Welcome! Check-in is from 3pm. WiFi: ${wifiName ?? "see stay guide"}${wifiPassword ? ` / ${wifiPassword}` : ""}. Your full MG Stays guest page has everything you need.`,
        isFromGuest: false,
        status: MessageStatus.AI_DRAFT,
        channel: config.channel,
        aiGenerated: true,
        aiConfidence: 0.91,
      },
    });
    messageCount = 2;
  }

  return messageCount;
}

async function seedPlatformBookings(
  propertyId: string,
  propertyName: string,
  source: string,
  externalListingId: string,
  nightlyRate: number
) {
  const samples: Array<{
    suffix: string;
    guestName: string;
    nights: number;
    status: BookingStatus;
    startOffsetDays: number;
    rateMultiplier: number;
  }> = [
    {
      suffix: "completed",
      guestName: "Emma Wilson",
      nights: 4,
      status: BookingStatus.CHECKED_OUT,
      startOffsetDays: -28,
      rateMultiplier: 1,
    },
    {
      suffix: "active",
      guestName: "James Chen",
      nights: 5,
      status: BookingStatus.CHECKED_IN,
      startOffsetDays: -2,
      rateMultiplier: 1.05,
    },
    {
      suffix: "upcoming",
      guestName: "Sophie Taylor",
      nights: 3,
      status: BookingStatus.UPCOMING,
      startOffsetDays: 12,
      rateMultiplier: 1.1,
    },
  ];

  for (const s of samples) {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + s.startOffsetDays);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + s.nights);
    const totalAmount = Math.round(s.nights * nightlyRate * s.rateMultiplier);

    await db.booking.upsert({
      where: { id: `sync-${externalListingId}-${s.suffix}` },
      update: {
        propertyId,
        platform: source,
        totalAmount,
        checkIn,
        checkOut,
        status: s.status,
      },
      create: {
        id: `sync-${externalListingId}-${s.suffix}`,
        propertyId,
        guestName: s.guestName,
        guestEmail: `${s.guestName.toLowerCase().replace(/\s/g, ".")}@guest.demo`,
        checkIn,
        checkOut,
        status: s.status,
        platform: source,
        platformRef: `${externalListingId}-${s.suffix}`,
        totalAmount,
        currency: "AUD",
        welcomeMessage: `Welcome to ${propertyName}!`,
      },
    });
  }
}

export async function syncPlatform(
  ownerId: string,
  platform: IntegrationPlatform,
  clientId?: string | null
) {
  if (platform === IntegrationPlatform.AIRBNB) {
    const oauthIntegration = await getAirbnbIntegration(ownerId, clientId);
    if (oauthIntegration?.connectionMode === "oauth" && oauthIntegration.accessToken) {
      return syncAirbnbFromApi(ownerId, clientId);
    }
  }

  const connectionKey =
    platform === IntegrationPlatform.AIRBNB
      ? airbnbConnectionKey(clientId)
      : "default";

  const integration = await db.platformIntegration.findUnique({
    where: {
      ownerId_platform_connectionKey: { ownerId, platform, connectionKey },
    },
  });

  if (!integration || integration.status === IntegrationStatus.DISCONNECTED) {
    throw new Error(`Connect ${platformDisplayName(PLATFORM_CONFIG[platform].source)} first`);
  }

  await db.platformIntegration.update({
    where: { id: integration.id },
    data: { status: IntegrationStatus.SYNCING },
  });

  const config = PLATFORM_CONFIG[platform];
  let imported = 0;
  let updated = 0;
  let messageCount = 0;

  if (platform === IntegrationPlatform.WHATSAPP) {
    const total = await db.property.count({ where: { ownerId } });
    await db.platformIntegration.update({
      where: { id: integration.id },
      data: {
        status: IntegrationStatus.CONNECTED,
        lastSyncAt: new Date(),
        propertyCount: total,
      },
    });
    return { imported: 0, updated: 0, messageCount: 0, total };
  }

  for (const p of config.properties) {
    const { property, created } = await upsertImportedProperty(ownerId, p, config.source);
    if (created) imported++;
    else updated++;

    messageCount += await ensureBookingAndMessages(
      property.id,
      p.name,
      p.externalListingId,
      platform,
      p.wifiName,
      p.wifiPassword
    );

    await seedPlatformBookings(
      property.id,
      p.name,
      config.source,
      p.externalListingId,
      p.nightlyRate ?? 200
    );
  }

  const total = await db.property.count({ where: { ownerId } });

  await db.platformIntegration.update({
    where: { id: integration.id },
    data: {
      status: IntegrationStatus.CONNECTED,
      lastSyncAt: new Date(),
      propertyCount: total,
      messageCount: integration.messageCount + messageCount,
    },
  });

  await db.notification.create({
    data: {
      userId: ownerId,
      title: `${platformDisplayName(config.source)} sync complete`,
      message: `Imported ${imported} new, updated ${updated} properties with demo bookings and revenue. Check your dashboard.`,
      type: NotificationType.SYSTEM,
      link: "/dashboard/properties",
    },
  });

  return { imported, updated, messageCount, total };
}

export async function syncAllConnectedPlatforms(ownerId: string) {
  const connected = await db.platformIntegration.findMany({
    where: { ownerId, status: IntegrationStatus.CONNECTED },
  });

  const results: Record<string, { imported: number; updated: number; messageCount: number }> = {};
  let totalImported = 0;
  let totalUpdated = 0;
  let totalMessages = 0;

  for (const int of connected) {
    if (int.platform === IntegrationPlatform.WHATSAPP) continue;
    const r = await syncPlatform(ownerId, int.platform);
    results[int.platform] = {
      imported: r.imported,
      updated: r.updated,
      messageCount: r.messageCount,
    };
    totalImported += r.imported;
    totalUpdated += r.updated;
    totalMessages += r.messageCount;
  }

  return { results, totalImported, totalUpdated, totalMessages };
}
