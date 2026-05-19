import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDbUser } from "@/lib/auth";
import { apiError } from "@/lib/api-errors";
import { db } from "@/lib/db";

const propertySchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional(),
  checkInInstructions: z.string().optional(),
  wifiName: z.string().optional(),
  wifiPassword: z.string().optional(),
  parkingInstructions: z.string().optional(),
  houseRules: z.string().optional(),
  checkoutInstructions: z.string().optional(),
  buildingAccess: z.string().optional(),
  emergencyContacts: z.string().optional(),
  localRecommendations: z.string().optional(),
  cleaningTeamName: z.string().optional(),
  cleaningTeamEmail: z.string().optional(),
  cleaningTeamPhone: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDbUser();
    const { id } = await params;
    const property = await db.property.findFirst({
      where: { id, ownerId: user.id },
    });
    if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(property);
  } catch (e) {
    return apiError(e);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDbUser();
    const { id } = await params;
    const body = await req.json();
    const data = propertySchema.parse(body);

    const existing = await db.property.findFirst({ where: { id, ownerId: user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const property = await db.property.update({ where: { id }, data });
    return NextResponse.json(property);
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDbUser();
    const { id } = await params;
    const existing = await db.property.findFirst({ where: { id, ownerId: user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.property.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return apiError(e);
  }
}
