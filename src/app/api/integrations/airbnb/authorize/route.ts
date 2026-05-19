import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { airbnbConnectionKey, isAirbnbOAuthConfigured } from "@/lib/integrations/airbnb/config";
import { buildAirbnbAuthorizeUrl } from "@/lib/integrations/airbnb/oauth";
import { createAirbnbOAuthState } from "@/lib/integrations/airbnb/oauth-state";

export async function GET(req: Request) {
  const user = await requireOwner();
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );

  if (!isAirbnbOAuthConfigured()) {
    return NextResponse.redirect(`${appUrl}/dashboard/integrations?airbnb=setup`);
  }

  if (clientId) {
    const client = await db.client.findFirst({
      where: { id: clientId, ownerId: user.id },
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
  }

  const connectionKey = airbnbConnectionKey(clientId);
  const state = createAirbnbOAuthState({
    ownerId: user.id,
    clientId: clientId ?? undefined,
    connectionKey,
  });

  return NextResponse.redirect(buildAirbnbAuthorizeUrl(state));
}
