import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import {
  connectPlatform,
  disconnectPlatform,
  parsePlatformSlug,
  syncPlatform,
} from "@/lib/integrations";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const user = await requireOwner();
  const { platform: raw } = await params;
  const platform = parsePlatformSlug(raw);
  if (!platform) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  const { action, clientId } = await req.json();

  try {
    if (action === "connect") {
      const integration = await connectPlatform(user.id, platform, clientId);
      return NextResponse.json(integration);
    }
    if (action === "sync") {
      const result = await syncPlatform(user.id, platform, clientId);
      return NextResponse.json(result);
    }
    if (action === "disconnect") {
      const integration = await disconnectPlatform(user.id, platform, clientId);
      return NextResponse.json(integration);
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
