import { IntegrationPlatform } from "@/generated/prisma/client";

export const AIRBNB_PLATFORM = IntegrationPlatform.AIRBNB;

export function isAirbnbOAuthConfigured() {
  return Boolean(
    process.env.AIRBNB_CLIENT_ID?.trim() && process.env.AIRBNB_CLIENT_SECRET?.trim()
  );
}

export function getAirbnbOAuthConfig() {
  const clientId = process.env.AIRBNB_CLIENT_ID?.trim();
  const clientSecret = process.env.AIRBNB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("Airbnb OAuth is not configured (AIRBNB_CLIENT_ID / AIRBNB_CLIENT_SECRET)");
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );

  return {
    clientId,
    clientSecret,
    redirectUri:
      process.env.AIRBNB_REDIRECT_URI?.trim() ??
      `${appUrl}/api/integrations/airbnb/callback`,
    authorizeUrl:
      process.env.AIRBNB_OAUTH_AUTHORIZE_URL?.trim() ??
      "https://www.airbnb.com/oauth2/auth",
    tokenUrl:
      process.env.AIRBNB_OAUTH_TOKEN_URL?.trim() ??
      "https://api.airbnb.com/v2/oauth2/token",
    apiBaseUrl:
      process.env.AIRBNB_API_BASE_URL?.trim() ?? "https://api.airbnb.com/v2",
    scopes: (process.env.AIRBNB_OAUTH_SCOPES ?? "homes:read reservations:read messages:read")
      .split(/[\s,]+/)
      .filter(Boolean),
  };
}

export function airbnbConnectionKey(clientId?: string | null) {
  return clientId?.trim() || "default";
}
