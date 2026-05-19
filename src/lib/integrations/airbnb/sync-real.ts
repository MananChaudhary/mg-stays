import {
  IntegrationPlatform,
  IntegrationStatus,
  NotificationType,
} from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { PLATFORM_CONFIG } from "../platforms";
import { upsertImportedProperty } from "../sync-property";
import { fetchAirbnbListings } from "./api";
import { getAirbnbIntegration, getValidAirbnbAccessToken } from "./tokens";

export async function syncAirbnbFromApi(
  ownerId: string,
  clientId?: string | null
) {
  const integration = await getAirbnbIntegration(ownerId, clientId);

  if (!integration || integration.connectionMode !== "oauth") {
    throw new Error("Connect Airbnb with OAuth first (host must sign in on Airbnb)");
  }

  const accessToken = await getValidAirbnbAccessToken(ownerId, clientId);
  const config = PLATFORM_CONFIG[IntegrationPlatform.AIRBNB];

  await db.platformIntegration.update({
    where: { id: integration.id },
    data: { status: IntegrationStatus.SYNCING },
  });

  let imported = 0;
  let updated = 0;

  try {
    const listings = await fetchAirbnbListings(accessToken);

    for (const listing of listings) {
      const { created } = await upsertImportedProperty(
        ownerId,
        listing,
        config.source,
        clientId ?? integration.clientId
      );
      if (created) imported++;
      else updated++;
    }

    const total = await db.property.count({ where: { ownerId } });

    await db.platformIntegration.update({
      where: { id: integration.id },
      data: {
        status: IntegrationStatus.CONNECTED,
        lastSyncAt: new Date(),
        propertyCount: total,
      },
    });

    await db.notification.create({
      data: {
        userId: ownerId,
        title: "Airbnb sync complete",
        message: `Imported ${imported} new and updated ${updated} listings from Airbnb.`,
        type: NotificationType.SYSTEM,
        link: "/dashboard/properties",
      },
    });

    return { imported, updated, messageCount: 0, total, mode: "oauth" as const };
  } catch (e) {
    await db.platformIntegration.update({
      where: { id: integration.id },
      data: { status: IntegrationStatus.ERROR },
    });
    throw e;
  }
}
