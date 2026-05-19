import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { IntegrationCard } from "@/components/integrations/platform-connect";
import { SyncAllButton } from "@/components/integrations/sync-all-button";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLATFORM_CONFIG } from "@/lib/integrations";
import { IntegrationPlatform, IntegrationStatus } from "@/generated/prisma/client";

const PLATFORM_ORDER: IntegrationPlatform[] = [
  IntegrationPlatform.AIRBNB,
  IntegrationPlatform.HOSTAWAY,
  IntegrationPlatform.BOOKING_COM,
  IntegrationPlatform.VRBO,
  IntegrationPlatform.WHATSAPP,
];

const DISPLAY_NAMES: Record<IntegrationPlatform, string> = {
  [IntegrationPlatform.AIRBNB]: "Airbnb",
  [IntegrationPlatform.HOSTAWAY]: "Hostaway",
  [IntegrationPlatform.BOOKING_COM]: "Booking.com",
  [IntegrationPlatform.VRBO]: "Vrbo",
  [IntegrationPlatform.WHATSAPP]: "WhatsApp",
};

export default async function IntegrationsPage() {
  const user = await getCurrentDbUser();
  const integrations = await db.platformIntegration.findMany({
    where: { ownerId: user?.id ?? "" },
  });

  const connectedCount = integrations.filter(
    (i) =>
      i.status === IntegrationStatus.CONNECTED &&
      i.platform !== IntegrationPlatform.WHATSAPP
  ).length;

  return (
    <>
      <DashboardHeader
        title="Integrations"
        description="Import properties from Airbnb, Hostaway & more — or add listings manually"
        action={
          <div className="flex flex-wrap gap-2">
            <SyncAllButton connectedCount={connectedCount} />
            <Button variant="outline" asChild>
              <Link href="/dashboard/properties/new">
                <Plus className="h-4 w-4" />
                Add property manually
              </Link>
            </Button>
          </div>
        }
      />
      <div className="space-y-6 p-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h3 className="font-semibold text-neutral-900">How property import works</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-neutral-600">
            <li>
              <strong>Connect</strong> a platform (Airbnb, Hostaway, Booking.com, Vrbo).
            </li>
            <li>
              <strong>Sync</strong> to pull listings, WiFi, check-in details, and sample guest
              messages into MG Stays.
            </li>
            <li>
              <strong>Add manually</strong> any property that is not on a platform — boutique
              stays, direct bookings, or one-offs.
            </li>
          </ol>
          <p className="mt-3 text-xs text-neutral-500">
            Demo mode simulates OAuth. Production requires Airbnb Partner API, Hostaway API key,
            etc.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Demo mode:</strong> Sync imports realistic sample listings per platform.
          Re-sync updates existing properties matched by listing ID.
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {PLATFORM_ORDER.map((platform) => {
            const config = PLATFORM_CONFIG[platform];
            const found = integrations.find((i) => i.platform === platform);
            return (
              <IntegrationCard
                key={platform}
                platform={platform}
                name={DISPLAY_NAMES[platform]}
                description={config.description}
                color={config.color}
                slug={config.slug}
                listingCount={config.properties.length}
                status={found?.status ?? IntegrationStatus.DISCONNECTED}
                accountLabel={found?.accountLabel ?? null}
                lastSyncAt={found?.lastSyncAt?.toISOString() ?? null}
                propertyCount={found?.propertyCount ?? 0}
                messageCount={found?.messageCount ?? 0}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
