import { NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensurePreviewBooking } from "@/lib/preview-booking";

export async function GET() {
  try {
    const user = await requireDbUser();
    const logs = await db.aIActivityLog.findMany({
      where: { property: { ownerId: user.id } },
      include: { property: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const sampleBooking = await db.booking.findFirst({
      where: { property: { ownerId: user.id } },
      orderBy: { createdAt: "desc" },
      select: { id: true, propertyId: true },
    });

    let sampleBookingId = sampleBooking?.id ?? null;
    let samplePropertyId = sampleBooking?.propertyId ?? null;

    if (!sampleBookingId) {
      const property = await db.property.findFirst({
        where: { ownerId: user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (property) {
        const preview = await ensurePreviewBooking(property.id);
        sampleBookingId = preview?.id ?? null;
        samplePropertyId = property.id;
      }
    }

    const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    const hasGooglePlacesKey = Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());

    return NextResponse.json({
      logs: logs.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
      })),
      sampleBookingId,
      samplePropertyId,
      hasAnthropicKey,
      hasGooglePlacesKey,
      aiMode: hasAnthropicKey ? "claude" : "demo",
      placesMode: hasGooglePlacesKey ? "google" : "demo",
    });
  } catch (e) {
    const { apiError } = await import("@/lib/api-errors");
    return apiError(e);
  }
}
