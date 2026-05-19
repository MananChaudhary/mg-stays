"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AirbnbConnectButton({
  clientId,
  label = "Connect with Airbnb",
  variant = "default",
  size = "sm",
}: {
  clientId?: string;
  label?: string;
  variant?: "default" | "outline";
  size?: "sm" | "default";
}) {
  const href = clientId
    ? `/api/integrations/airbnb/authorize?clientId=${encodeURIComponent(clientId)}`
    : "/api/integrations/airbnb/authorize";

  return (
    <Button size={size} variant={variant} asChild>
      <a href={href}>{label}</a>
    </Button>
  );
}

export function AirbnbConnectLoadingButton({
  loading,
  onDemoConnect,
  oauthEnabled,
}: {
  loading: boolean;
  onDemoConnect: () => void;
  oauthEnabled: boolean;
}) {
  if (oauthEnabled) {
    return <AirbnbConnectButton label={loading ? "Opening…" : "Connect with Airbnb"} />;
  }

  return (
    <Button size="sm" onClick={onDemoConnect} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect (demo)"}
    </Button>
  );
}
