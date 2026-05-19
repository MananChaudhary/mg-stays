import { Badge } from "@/components/ui/badge";

const SOURCE_LABELS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "accent" }
> = {
  manual: { label: "Manual", variant: "secondary" },
  airbnb: { label: "Airbnb", variant: "accent" },
  hostaway: { label: "Hostaway", variant: "accent" },
  booking_com: { label: "Booking.com", variant: "accent" },
  vrbo: { label: "Vrbo", variant: "accent" },
};

export function PropertySourceBadge({ source }: { source: string }) {
  const key = source || "manual";
  const config = SOURCE_LABELS[key] ?? { label: key, variant: "secondary" as const };
  return (
    <Badge variant={config.variant} className="text-[10px] font-medium uppercase tracking-wide">
      {config.label}
    </Badge>
  );
}
