import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { ConversationView } from "@/components/messages/conversation-view";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  const conversation = await db.conversation.findFirst({
    where: { id, property: { ownerId: user?.id ?? "" } },
    include: {
      property: true,
      booking: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) notFound();

  const cleaningAlerts = await db.cleaningAlert.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <>
      <DashboardHeader
        title={`${conversation.booking?.guestName ?? "Guest"} · ${conversation.property.name}`}
        description="Guest conversation"
      />
      <ConversationView conversation={conversation} cleaningAlerts={cleaningAlerts} />
    </>
  );
}
