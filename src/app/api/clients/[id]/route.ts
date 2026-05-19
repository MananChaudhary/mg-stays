import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  propertyIds: z.array(z.string()).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireOwner();
  const { id } = await params;
  const client = await db.client.findFirst({
    where: { id, ownerId: user.id },
    include: {
      properties: true,
    },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireOwner();
  const { id } = await params;
  const body = await req.json();
  const data = schema.parse(body);

  const existing = await db.client.findFirst({ where: { id, ownerId: user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const client = await db.client.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone,
      company: data.company,
      notes: data.notes,
    },
  });

  if (data.propertyIds !== undefined) {
    await db.property.updateMany({
      where: { ownerId: user.id, clientId: id },
      data: { clientId: null },
    });
    if (data.propertyIds.length > 0) {
      await db.property.updateMany({
        where: { id: { in: data.propertyIds }, ownerId: user.id },
        data: { clientId: id },
      });
    }
  }

  return NextResponse.json(client);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireOwner();
  const { id } = await params;
  const existing = await db.client.findFirst({ where: { id, ownerId: user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.property.updateMany({ where: { clientId: id }, data: { clientId: null } });
  await db.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
