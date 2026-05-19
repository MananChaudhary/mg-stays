"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import type { IntegrationPlatform } from "@/generated/prisma/client";

interface IntegrationCardProps {
  platform: IntegrationPlatform;
  name: string;
  description: string;
  color: string;
  slug: string;
  listingCount: number;
  status: string;
  accountLabel: string | null;
  lastSyncAt: string | null;
  propertyCount: number;
  messageCount: number;
}

export function IntegrationCard(props: IntegrationCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const connected = props.status === "CONNECTED" || props.status === "SYNCING";
  const isWhatsApp = props.platform === "WHATSAPP";

  async function runAction(action: "connect" | "sync" | "disconnect") {
    setLoading(action);
    try {
      const res = await fetch(`/api/integrations/${props.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (action === "sync") {
        if (isWhatsApp) {
          toast.success("WhatsApp messaging channel ready");
        } else {
          toast.success(
            `Imported ${data.imported} new, updated ${data.updated} properties · ${data.messageCount} messages`
          );
        }
      } else if (action === "connect") {
        toast.success(
          isWhatsApp
            ? `${props.name} connected`
            : `${props.name} connected — run sync to import ${props.listingCount} listings`
        );
      } else {
        toast.success(`${props.name} disconnected`);
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white ${props.color}`}
          >
            {props.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">{props.name}</h3>
            <p className="text-sm text-neutral-500">{props.description}</p>
            {!isWhatsApp && props.listingCount > 0 && (
              <p className="mt-1 text-xs text-neutral-400">
                Demo: {props.listingCount} listings available to sync
              </p>
            )}
          </div>
        </div>
        <Badge variant={connected ? "success" : "secondary"}>
          {props.status === "SYNCING" ? "Syncing…" : connected ? "Connected" : "Not connected"}
        </Badge>
      </div>

      {connected && (
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-neutral-50 p-3 text-center text-sm">
          <div>
            <p className="font-semibold text-neutral-900">{props.propertyCount}</p>
            <p className="text-xs text-neutral-500">Properties</p>
          </div>
          <div>
            <p className="font-semibold text-neutral-900">{props.messageCount}</p>
            <p className="text-xs text-neutral-500">Messages</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-700">
              {props.lastSyncAt ? formatDateTime(props.lastSyncAt) : "Never"}
            </p>
            <p className="text-xs text-neutral-500">Last sync</p>
          </div>
        </div>
      )}

      {props.accountLabel && (
        <p className="mt-3 text-xs text-neutral-500">{props.accountLabel}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!connected ? (
          <Button size="sm" onClick={() => runAction("connect")} disabled={!!loading}>
            {loading === "connect" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runAction("sync")}
              disabled={!!loading}
            >
              {loading === "sync" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isWhatsApp ? "Activate channel" : "Sync properties & messages"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => runAction("disconnect")}
              disabled={!!loading}
            >
              <Unplug className="h-4 w-4" />
              Disconnect
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
