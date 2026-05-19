import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";

const bookingSchema = z.object({
  propertyId: z.string(),
  guestName: z.string().min(1),
  guestEmail: z.string().email().optional().or(z.literal("")),
  guestPhone: z.string().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  welcomeMessage: z.string().optional(),
  platform: z.string().optional(),
  totalAmount: z.number().positive().optional(),
  currency: z.string().optional(),
});

export async function GET() {
  const user = await requireDbUser();
  const bookings = await db.booking.findMany({
    where: { property: { ownerId: user.id } },
    include: { property: true },
    orderBy: { checkIn: "desc" },
  });
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const user = await requireDbUser();
  const body = await req.json();
  const data = bookingSchema.parse(body);

  const property = await db.property.findFirst({
    where: { id: data.propertyId, ownerId: user.id },
  });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const booking = await db.booking.create({
    data: {
      propertyId: data.propertyId,
      guestName: data.guestName,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone || null,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      welcomeMessage: data.welcomeMessage,
      platform: data.platform ?? "direct",
      totalAmount: data.totalAmount,
      currency: data.currency ?? "AUD",
    },
  });

  await db.conversation.create({
    data: {
      propertyId: data.propertyId,
      bookingId: booking.id,
      subject: `Stay for ${data.guestName}`,
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
