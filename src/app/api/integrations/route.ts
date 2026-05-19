import { NextResponse } from "next/server";
import { IntegrationPlatform, IntegrationStatus } from "@/generated/prisma/client";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";

const PLATFORMS = Object.values(IntegrationPlatform);

export async function GET() {
  const user = await requireOwner();
  const integrations = await db.platformIntegration.findMany({
    where: { ownerId: user.id },
  });

  const result = PLATFORMS.map((platform) => {
    const found = integrations.find((i) => i.platform === platform);
    return (
      found ?? {
        platform,
        status: IntegrationStatus.DISCONNECTED,
        accountLabel: null,
        lastSyncAt: null,
        propertyCount: 0,
        messageCount: 0,
      }
    );
  });

  return NextResponse.json(result);
}
