import { BookingStatus } from "@/generated/prisma/client";
import { db } from "./db";

/** Ensures a preview booking exists so AI chat can be tested without a real guest booking */
export async function ensurePreviewBooking(propertyId: string) {
  const property = await db.property.findUnique({ where: { id: propertyId } });
  if (!property) return null;

  const previewBookingId = `preview-${propertyId}`;

  return db.booking.upsert({
    where: { id: previewBookingId },
    update: { propertyId: property.id },
    create: {
      id: previewBookingId,
      propertyId: property.id,
      guestName: "Preview Guest",
      guestEmail: "preview@mgstays.demo",
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: BookingStatus.UPCOMING,
      platform: "preview",
      welcomeMessage: `Welcome! This is a preview of the guest stay page for ${property.name}.`,
    },
    include: { property: true },
  });
}
