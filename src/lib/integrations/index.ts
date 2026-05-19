import { IntegrationPlatform, IntegrationStatus } from "@/generated/prisma/client";
import { db } from "../db";
import { PLATFORM_CONFIG } from "./platforms";
export { PLATFORM_CONFIG, parsePlatformSlug, ALL_PLATFORMS } from "./platforms";
export { syncPlatform, syncAllConnectedPlatforms } from "./sync";

export async function connectPlatform(ownerId: string, platform: IntegrationPlatform) {
  const config = PLATFORM_CONFIG[platform];

  return db.platformIntegration.upsert({
    where: { ownerId_platform: { ownerId, platform } },
    update: {
      status: IntegrationStatus.CONNECTED,
      accountLabel: config.label,
    },
    create: {
      ownerId,
      platform,
      status: IntegrationStatus.CONNECTED,
      accountLabel: config.label,
    },
  });
}

export async function disconnectPlatform(ownerId: string, platform: IntegrationPlatform) {
  return db.platformIntegration.update({
    where: { ownerId_platform: { ownerId, platform } },
    data: {
      status: IntegrationStatus.DISCONNECTED,
      accountLabel: null,
      lastSyncAt: null,
    },
  });
}
