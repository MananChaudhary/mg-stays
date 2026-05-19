import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  propertyIds: z.array(z.string()).optional(),
});

export async function GET() {
  const user = await requireOwner();
  const clients = await db.client.findMany({
    where: { ownerId: user.id },
    include: {
      properties: { select: { id: true, name: true, address: true, externalPlatform: true } },
      _count: { select: { properties: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const user = await requireOwner();
  const body = await req.json();
  const data = schema.parse(body);

  const client = await db.client.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      notes: data.notes || null,
      ownerId: user.id,
    },
  });

  if (data.propertyIds?.length) {
    await db.property.updateMany({
      where: { id: { in: data.propertyIds }, ownerId: user.id },
      data: { clientId: client.id },
    });
  }

  return NextResponse.json(client, { status: 201 });
}
