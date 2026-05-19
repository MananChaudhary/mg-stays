import { IntegrationPlatform, IntegrationStatus } from "@/generated/prisma/client";
import { db } from "../db";
import { airbnbConnectionKey } from "./airbnb/config";
import { clearAirbnbTokens } from "./airbnb/tokens";
import { PLATFORM_CONFIG } from "./platforms";
export { PLATFORM_CONFIG, parsePlatformSlug, ALL_PLATFORMS } from "./platforms";
export { isAirbnbOAuthConfigured } from "./airbnb/config";
export { syncPlatform, syncAllConnectedPlatforms } from "./sync";

function connectionKeyFor(platform: IntegrationPlatform, clientId?: string | null) {
  return platform === IntegrationPlatform.AIRBNB ? airbnbConnectionKey(clientId) : "default";
}

function integrationWhere(
  ownerId: string,
  platform: IntegrationPlatform,
  clientId?: string | null
) {
  return {
    ownerId_platform_connectionKey: {
      ownerId,
      platform,
      connectionKey: connectionKeyFor(platform, clientId),
    },
  } as const;
}

export async function connectPlatform(
  ownerId: string,
  platform: IntegrationPlatform,
  clientId?: string | null
) {
  const config = PLATFORM_CONFIG[platform];
  const connectionKey = connectionKeyFor(platform, clientId);

  return db.platformIntegration.upsert({
    where: integrationWhere(ownerId, platform, clientId),
    update: {
      status: IntegrationStatus.CONNECTED,
      connectionMode: "demo",
      accountLabel: config.label,
      clientId: clientId ?? null,
    },
    create: {
      ownerId,
      platform,
      connectionKey,
      clientId: clientId ?? null,
      status: IntegrationStatus.CONNECTED,
      connectionMode: "demo",
      accountLabel: config.label,
    },
  });
}

export async function disconnectPlatform(
  ownerId: string,
  platform: IntegrationPlatform,
  clientId?: string | null
) {
  if (platform === IntegrationPlatform.AIRBNB) {
    return clearAirbnbTokens(ownerId, clientId);
  }

  return db.platformIntegration.update({
    where: integrationWhere(ownerId, platform, clientId),
    data: {
      status: IntegrationStatus.DISCONNECTED,
      connectionMode: "demo",
      accountLabel: null,
      lastSyncAt: null,
    },
  });
}
