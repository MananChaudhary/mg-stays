import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function MessagesPage() {
  const user = await getCurrentDbUser();
  const conversations = await db.conversation.findMany({
    where: { property: { ownerId: user?.id ?? "" } },
    include: {
      property: true,
      booking: true,
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const conversationIds = conversations.map((c) => c.id);
  const cleaningAlerts =
    conversationIds.length > 0
      ? await db.cleaningAlert.findMany({
          where: { conversationId: { in: conversationIds } },
          select: { conversationId: true },
        })
      : [];
  const cleaningConvIds = new Set(
    cleaningAlerts.map((a) => a.conversationId).filter(Boolean) as string[]
  );

  return (
    <>
      <DashboardHeader
        title="Guest Messages"
        description="Review AI drafts and respond to guests — cleaning issues notify your team automatically"
      />
      <div className="p-8">
        <div className="space-y-3">
          {conversations.length === 0 ? (
            <p className="text-neutral-500">No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/dashboard/messages/${conv.id}`}
                className="flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition-colors hover:bg-neutral-50"
              >
                <div>
                  <p className="font-medium">
                    {conv.booking?.guestName ?? "Guest"} · {conv.property.name}
                  </p>
                  <p className="mt-1 max-w-md truncate text-sm text-neutral-500">
                    {conv.messages[0]?.isSystemMessage
                      ? "Cleaning team notified"
                      : (conv.messages[0]?.content ?? "No messages")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {cleaningConvIds.has(conv.id) && (
                    <Badge variant="success">Cleaning alert</Badge>
                  )}
                  {conv.messages[0]?.channel && conv.messages[0].channel !== "IN_APP" && (
                    <Badge variant="secondary">
                      {conv.messages[0].channel.replace("_", ".")}
                    </Badge>
                  )}
                  {conv.messages[0]?.status === "AI_DRAFT" && (
                    <Badge variant="accent">AI Draft</Badge>
                  )}
                  {conv.messages[0]?.status === "ESCALATED" && (
                    <Badge variant="danger">Escalated</Badge>
                  )}
                  <span className="text-xs text-neutral-400">
                    {conv.messages[0] ? formatDateTime(conv.messages[0].createdAt) : ""}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
