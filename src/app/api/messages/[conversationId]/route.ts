import { NextResponse } from "next/server";
import { z } from "zod";
import { MessageStatus } from "@/generated/prisma/client";
import { requireDbUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  content: z.string().min(1),
  messageId: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const user = await requireDbUser();
  const { conversationId } = await params;
  const body = await req.json();
  const { content, messageId } = schema.parse(body);

  const conversation = await db.conversation.findFirst({
    where: { id: conversationId, property: { ownerId: user.id } },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (messageId) {
    await db.message.update({
      where: { id: messageId },
      data: { content, status: MessageStatus.SENT, aiGenerated: true },
    });
  } else {
    await db.message.create({
      data: {
        conversationId,
        content,
        isFromGuest: false,
        status: MessageStatus.SENT,
        sentByUserId: user.id,
      },
    });
  }

  await db.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
