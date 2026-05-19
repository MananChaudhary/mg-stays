const PLATFORM_LABELS: Record<string, string> = {
  airbnb: "Airbnb",
  hostaway: "Hostaway",
  booking_com: "Booking.com",
  vrbo: "Vrbo",
  manual: "Manual",
  direct: "Direct",
  preview: "Preview",
};

export function platformLabel(platform: string | null | undefined) {
  if (!platform) return "Direct";
  return PLATFORM_LABELS[platform] ?? platform;
}

export function formatMoney(amount: number, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
