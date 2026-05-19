import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export type AirbnbOAuthState = {
  ownerId: string;
  clientId?: string;
  connectionKey: string;
  nonce: string;
  exp: number;
};

function stateSecret() {
  return (
    process.env.AIRBNB_OAUTH_STATE_SECRET?.trim() ||
    process.env.CLERK_SECRET_KEY?.trim() ||
    "mg-stays-dev-oauth-state"
  );
}

export function signAirbnbOAuthState(payload: AirbnbOAuthState): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyAirbnbOAuthState(token: string): AirbnbOAuthState | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", stateSecret()).update(body).digest("base64url");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as AirbnbOAuthState;
    if (!payload.ownerId || !payload.connectionKey || !payload.nonce || !payload.exp) {
      return null;
    }
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createAirbnbOAuthState(input: {
  ownerId: string;
  clientId?: string;
  connectionKey: string;
}): string {
  const payload: AirbnbOAuthState = {
    ownerId: input.ownerId,
    clientId: input.clientId,
    connectionKey: input.connectionKey,
    nonce: randomBytes(16).toString("hex"),
    exp: Date.now() + 15 * 60 * 1000,
  };
  return signAirbnbOAuthState(payload);
}
