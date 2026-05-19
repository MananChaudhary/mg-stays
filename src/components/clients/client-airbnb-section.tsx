import Link from "next/link";
import { IntegrationStatus } from "@/generated/prisma/client";
import { isAirbnbOAuthConfigured } from "@/lib/integrations/airbnb/config";
import { AirbnbConnectButton } from "@/components/integrations/airbnb-connect-button";
import { Badge } from "@/components/ui/badge";
import { ClientAirbnbSyncButton } from "@/components/clients/client-airbnb-sync-button";

export function ClientAirbnbSection({
  clientId,
  clientName,
  integration,
}: {
  clientId: string;
  clientName: string;
  integration?: {
    status: IntegrationStatus;
    connectionMode: string | null;
    accountLabel: string | null;
    lastSyncAt: Date | null;
  } | null;
}) {
  const oauthReady = isAirbnbOAuthConfigured();
  const connected =
    integration?.status === IntegrationStatus.CONNECTED ||
    integration?.status === IntegrationStatus.SYNCING;
  const isOAuth = integration?.connectionMode === "oauth";

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-neutral-900">Airbnb for {clientName}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            The host must sign in with <strong>their</strong> Airbnb account once. You cannot
            connect without them — send this link or do it on a call while they log in.
          </p>
        </div>
        {connected && (
          <Badge variant="success">{isOAuth ? "Airbnb linked" : "Demo linked"}</Badge>
        )}
      </div>

      {integration?.accountLabel && (
        <p className="mt-3 text-xs text-neutral-500">{integration.accountLabel}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!connected ? (
          oauthReady ? (
            <AirbnbConnectButton clientId={clientId} label="Connect client’s Airbnb" />
          ) : (
            <p className="text-sm text-amber-800">
              Add <code className="text-xs">AIRBNB_CLIENT_ID</code> and{" "}
              <code className="text-xs">AIRBNB_CLIENT_SECRET</code> to enable real Airbnb.{" "}
              <Link href="/dashboard/integrations" className="underline">
                Setup guide
              </Link>
            </p>
          )
        ) : (
          <>
            <ClientAirbnbSyncButton clientId={clientId} />
            {isOAuth && (
              <AirbnbConnectButton
                clientId={clientId}
                label="Reconnect Airbnb"
                variant="outline"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
