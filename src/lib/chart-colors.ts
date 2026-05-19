export const PLATFORM_CHART_COLORS: Record<string, string> = {
  airbnb: "#FF5A5F",
  hostaway: "#2563eb",
  booking_com: "#003580",
  vrbo: "#3D5A80",
  manual: "#737373",
  direct: "#a3a3a3",
  preview: "#d4d4d4",
};

export function chartColorForSource(source: string) {
  return PLATFORM_CHART_COLORS[source] ?? "#10b981";
}
