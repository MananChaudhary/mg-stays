import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exchangeAirbnbCode, tokenExpiresAtFromResponse } from "@/lib/integrations/airbnb/oauth";
import { verifyAirbnbOAuthState } from "@/lib/integrations/airbnb/oauth-state";
import { saveAirbnbTokens } from "@/lib/integrations/airbnb/tokens";

export async function GET(req: Request) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    const msg = encodeURIComponent(errorDescription ?? error);
    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?airbnb=error&message=${msg}`
    );
  }

  if (!code || !stateRaw) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?airbnb=error&message=${encodeURIComponent("Missing authorization code")}`
    );
  }

  const state = verifyAirbnbOAuthState(stateRaw);
  if (!state) {
    return NextResponse.redirect(
      `${appUrl}/dashboard/integrations?airbnb=error&message=${encodeURIComponent("Invalid or expired session")}`
    );
  }

  try {
    const tokens = await exchangeAirbnbCode(code);
    const tokenExpiresAt = tokenExpiresAtFromResponse(tokens);

    let accountLabel = "Airbnb host account";
    if (state.clientId) {
      const client = await db.client.findFirst({
        where: { id: state.clientId, ownerId: state.ownerId },
      });
      if (client) accountLabel = `Airbnb — ${client.name}`;
    }

    await saveAirbnbTokens(state.ownerId, {
      clientId: state.clientId,
      connectionKey: state.connectionKey,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt,
      externalUserId: tokens.user_id != null ? String(tokens.user_id) : undefined,
      accountLabel,
    });

    const redirectBase = state.clientId
      ? `${appUrl}/dashboard/clients/${state.clientId}`
      : `${appUrl}/dashboard/integrations`;

    return NextResponse.redirect(
      `${redirectBase}?airbnb=connected&message=${encodeURIComponent("Airbnb connected — run Sync to import listings")}`
    );
  } catch (e) {
    const msg = encodeURIComponent(
      e instanceof Error ? e.message : "Failed to connect Airbnb"
    );
    return NextResponse.redirect(`${appUrl}/dashboard/integrations?airbnb=error&message=${msg}`);
  }
}
