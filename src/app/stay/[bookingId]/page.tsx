import { notFound } from "next/navigation";
import { StayPage } from "@/components/guest/stay-page";
import { db } from "@/lib/db";

export default async function GuestStayPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { property: true },
  });

  if (!booking) notFound();

  return <StayPage booking={booking} />;
}
