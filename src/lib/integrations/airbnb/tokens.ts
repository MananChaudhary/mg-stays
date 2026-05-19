import { IntegrationPlatform, IntegrationStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { AIRBNB_PLATFORM, airbnbConnectionKey } from "./config";
import { refreshAirbnbAccessToken, tokenExpiresAtFromResponse } from "./oauth";

export async function getAirbnbIntegration(
  ownerId: string,
  clientId?: string | null
) {
  const connectionKey = airbnbConnectionKey(clientId);
  return db.platformIntegration.findUnique({
    where: {
      ownerId_platform_connectionKey: {
        ownerId,
        platform: AIRBNB_PLATFORM,
        connectionKey,
      },
    },
  });
}

export async function saveAirbnbTokens(
  ownerId: string,
  input: {
    clientId?: string | null;
    connectionKey: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt: Date | null;
    externalUserId?: string;
    accountLabel?: string;
  }
) {
  return db.platformIntegration.upsert({
    where: {
      ownerId_platform_connectionKey: {
        ownerId,
        platform: AIRBNB_PLATFORM,
        connectionKey: input.connectionKey,
      },
    },
    update: {
      status: IntegrationStatus.CONNECTED,
      connectionMode: "oauth",
      clientId: input.clientId ?? null,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken ?? null,
      tokenExpiresAt: input.tokenExpiresAt,
      externalUserId: input.externalUserId ?? null,
      accountLabel: input.accountLabel ?? "Airbnb host account",
    },
    create: {
      ownerId,
      platform: AIRBNB_PLATFORM,
      connectionKey: input.connectionKey,
      clientId: input.clientId ?? null,
      status: IntegrationStatus.CONNECTED,
      connectionMode: "oauth",
      accessToken: input.accessToken,
      refreshToken: input.refreshToken ?? null,
      tokenExpiresAt: input.tokenExpiresAt,
      externalUserId: input.externalUserId ?? null,
      accountLabel: input.accountLabel ?? "Airbnb host account",
    },
  });
}

export async function clearAirbnbTokens(ownerId: string, clientId?: string | null) {
  const connectionKey = airbnbConnectionKey(clientId);
  return db.platformIntegration.update({
    where: {
      ownerId_platform_connectionKey: {
        ownerId,
        platform: AIRBNB_PLATFORM,
        connectionKey,
      },
    },
    data: {
      status: IntegrationStatus.DISCONNECTED,
      connectionMode: "demo",
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      externalUserId: null,
      accountLabel: null,
      lastSyncAt: null,
    },
  });
}

/** Returns a valid access token, refreshing when close to expiry. */
export async function getValidAirbnbAccessToken(
  ownerId: string,
  clientId?: string | null
): Promise<string> {
  const integration = await getAirbnbIntegration(ownerId, clientId);
  if (!integration?.accessToken) {
    throw new Error("Airbnb is not connected for this account");
  }

  const expires = integration.tokenExpiresAt?.getTime() ?? 0;
  const needsRefresh = expires > 0 && expires - Date.now() < 5 * 60 * 1000;

  if (!needsRefresh || !integration.refreshToken) {
    return integration.accessToken;
  }

  const refreshed = await refreshAirbnbAccessToken(integration.refreshToken);
  const tokenExpiresAt = tokenExpiresAtFromResponse(refreshed);

  await db.platformIntegration.update({
    where: { id: integration.id },
    data: {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? integration.refreshToken,
      tokenExpiresAt,
    },
  });

  return refreshed.access_token;
}
