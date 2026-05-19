import { NextResponse } from "next/server";
import { z } from "zod";
import { MessageStatus, NotificationType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { generateGuestReply } from "@/lib/ai";
import {
  cleaningReplyForGuest,
  handleCleaningComplaint,
  isCleaningComplaint,
} from "@/lib/cleaning-alerts";

const schema = z.object({
  bookingId: z.string(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, message } = schema.parse(body);

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: { include: { owner: true } },
        conversation: { include: { messages: { orderBy: { createdAt: "asc" } } } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    let conversation = booking.conversation;
    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          propertyId: booking.propertyId,
          bookingId: booking.id,
          subject: `Stay for ${booking.guestName}`,
        },
        include: { messages: true },
      });
    }

    await db.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        isFromGuest: true,
        status: MessageStatus.SENT,
      },
    });

    const cleaningIssue = isCleaningComplaint(message);
    let cleaningAlertSent = false;

    if (cleaningIssue) {
      const result = await handleCleaningComplaint({
        property: booking.property,
        booking: {
          id: booking.id,
          guestName: booking.guestName,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        },
        conversationId: conversation.id,
        guestMessage: message,
      });
      cleaningAlertSent = result.teamConfigured;
    }

    const history = (conversation.messages ?? []).map((m) => ({
      role: (m.isFromGuest ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    }));

    const aiResponse = cleaningIssue
      ? {
          content: cleaningReplyForGuest(booking.property.name, cleaningAlertSent),
          confidence: 0.95,
          escalated: true,
        }
      : await generateGuestReply(booking.property, history, message);

    const aiMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        content: aiResponse.content,
        isFromGuest: false,
        status: aiResponse.escalated ? MessageStatus.ESCALATED : MessageStatus.AI_DRAFT,
        aiGenerated: true,
        aiConfidence: aiResponse.confidence,
      },
    });

    await db.aIActivityLog.create({
      data: {
        propertyId: booking.propertyId,
        action: cleaningIssue
          ? "cleaning_alert"
          : aiResponse.escalated
            ? "escalation"
            : "reply",
        query: message,
        response: aiResponse.content,
        escalated: aiResponse.escalated || cleaningIssue,
        confidence: aiResponse.confidence,
      },
    });

    if (aiResponse.escalated && !cleaningIssue) {
      await db.notification.create({
        data: {
          userId: booking.property.ownerId,
          title: "AI Escalation",
          message: `Guest at ${booking.property.name} needs host attention: "${message.slice(0, 80)}..."`,
          type: NotificationType.AI_ESCALATION,
          link: `/dashboard/messages/${conversation.id}`,
        },
      });
    }

    return NextResponse.json({
      reply: aiResponse.content,
      messageId: aiMessage.id,
      escalated: aiResponse.escalated,
      cleaningAlertSent,
    });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Failed to process message";
    console.error("[api/ai/chat]", e);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
