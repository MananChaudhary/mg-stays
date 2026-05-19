import { notFound } from "next/navigation";
import { StayPage } from "@/components/guest/stay-page";
import { db } from "@/lib/db";
import { ensurePreviewBooking } from "@/lib/preview-booking";

export default async function GuestStayPreviewPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;

  const property = await db.property.findUnique({ where: { id: propertyId } });
  if (!property) notFound();

  const booking = await ensurePreviewBooking(propertyId);
  if (!booking) notFound();

  return <StayPage booking={booking} />;
}
