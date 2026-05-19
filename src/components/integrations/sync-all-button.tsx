"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SyncAllButton({ connectedCount }: { connectedCount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (connectedCount === 0) return null;

  async function handleSyncAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/sync-all", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(
        `Synced all platforms: ${data.totalImported} new, ${data.totalUpdated} updated properties`
      );
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleSyncAll} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Sync all connected platforms
    </Button>
  );
}
