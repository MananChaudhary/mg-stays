import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { IntegrationCard } from "@/components/integrations/platform-connect";
import { SyncAllButton } from "@/components/integrations/sync-all-button";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAirbnbOAuthConfigured, PLATFORM_CONFIG } from "@/lib/integrations";
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

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ airbnb?: string; message?: string }>;
}) {
  const user = await getCurrentDbUser();
  const params = await searchParams;
  const integrations = await db.platformIntegration.findMany({
    where: { ownerId: user?.id ?? "" },
  });
  const airbnbOAuthEnabled = isAirbnbOAuthConfigured();

  const connectedCount = integrations.filter(
    (i) =>
      i.status === IntegrationStatus.CONNECTED &&
      i.platform !== IntegrationPlatform.WHATSAPP
  ).length;

  const defaultAirbnb = integrations.find(
    (i) =>
      i.platform === IntegrationPlatform.AIRBNB && i.connectionKey === "default"
  );
  const clientAirbnbConnections = integrations.filter(
    (i) => i.platform === IntegrationPlatform.AIRBNB && i.connectionKey !== "default"
  );

  return (
    <>
      <DashboardHeader
        title="Integrations"
        description="Connect each host's Airbnb account, or import demo data for other platforms"
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
        {params.airbnb === "setup" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Airbnb API keys needed.</strong> Register at{" "}
            <a
              href="https://developer.airbnb.com"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              developer.airbnb.com
            </a>
            , then set <code>AIRBNB_CLIENT_ID</code> and <code>AIRBNB_CLIENT_SECRET</code> in
            Vercel (redirect:{" "}
            <code>{process.env.NEXT_PUBLIC_APP_URL}/api/integrations/airbnb/callback</code>).
          </div>
        )}
        {params.airbnb === "connected" && params.message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            {decodeURIComponent(params.message)}
          </div>
        )}
        {params.airbnb === "error" && params.message && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {decodeURIComponent(params.message)}
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h3 className="font-semibold text-neutral-900">Connecting your clients&apos; Airbnbs</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-neutral-600">
            <li>
              Create a <strong>Client</strong> in MG Stays for each host you manage.
            </li>
            <li>
              Open their client page → <strong>Connect client&apos;s Airbnb</strong> (they must sign
              in with their Airbnb host account — you cannot skip this step).
            </li>
            <li>
              Click <strong>Sync</strong> on the Airbnb card to pull their listings into Neon.
            </li>
          </ol>
          <p className="mt-3 text-xs text-neutral-500">
            One Airbnb login = one connection. Ten clients = ten separate connect flows.
          </p>
        </div>

        {clientAirbnbConnections.length > 0 && (
          <div className="rounded-2xl border border-neutral-100 bg-white p-5">
            <h3 className="font-semibold">Client Airbnb connections</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {clientAirbnbConnections.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span>{i.accountLabel ?? "Airbnb host"}</span>
                  <Link
                    href={
                      i.clientId
                        ? `/dashboard/clients/${i.clientId}`
                        : "/dashboard/clients"
                    }
                    className="text-amber-700 hover:underline"
                  >
                    View client
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {PLATFORM_ORDER.map((platform) => {
            const config = PLATFORM_CONFIG[platform];
            const found =
              platform === IntegrationPlatform.AIRBNB
                ? defaultAirbnb
                : integrations.find(
                    (i) => i.platform === platform && i.connectionKey === "default"
                  );
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
                connectionMode={found?.connectionMode ?? null}
                airbnbOAuthEnabled={airbnbOAuthEnabled}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
