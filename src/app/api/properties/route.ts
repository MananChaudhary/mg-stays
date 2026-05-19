import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";

const propertySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
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
});

export async function GET() {
  const user = await requireDbUser();
  const properties = await db.property.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(properties);
}

export async function POST(req: Request) {
  try {
    const user = await requireDbUser();
    const body = await req.json();
    const data = propertySchema.parse(body);

    const property = await db.property.create({
      data: {
        ...data,
        ownerId: user.id,
        source: "manual",
        externalPlatform: null,
        externalListingId: null,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (e) {
    const { apiError } = await import("@/lib/api-errors");
    return apiError(e);
  }
}
