import { getAirbnbOAuthConfig } from "./config";

export type AirbnbTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user_id?: string | number;
  token_type?: string;
};

export function buildAirbnbAuthorizeUrl(state: string) {
  const config = getAirbnbOAuthConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    state,
  });
  if (config.scopes.length > 0) {
    params.set("scope", config.scopes.join(" "));
  }
  return `${config.authorizeUrl}?${params.toString()}`;
}

export async function exchangeAirbnbCode(code: string): Promise<AirbnbTokenResponse> {
  const config = getAirbnbOAuthConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
    code,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as AirbnbTokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!res.ok) {
    throw new Error(
      data.error_description ?? data.error ?? `Airbnb token exchange failed (${res.status})`
    );
  }

  if (!data.access_token) {
    throw new Error("Airbnb did not return an access token");
  }

  return data;
}

export async function refreshAirbnbAccessToken(
  refreshToken: string
): Promise<AirbnbTokenResponse> {
  const config = getAirbnbOAuthConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as AirbnbTokenResponse & {
    error?: string;
    error_description?: string;
  };

  if (!res.ok) {
    throw new Error(
      data.error_description ?? data.error ?? `Airbnb token refresh failed (${res.status})`
    );
  }

  if (!data.access_token) {
    throw new Error("Airbnb did not return an access token");
  }

  return data;
}

export function tokenExpiresAtFromResponse(data: AirbnbTokenResponse): Date | null {
  if (data.expires_at) {
    return new Date(data.expires_at * 1000);
  }
  return new Date(Date.now() + 23 * 60 * 60 * 1000);
}
