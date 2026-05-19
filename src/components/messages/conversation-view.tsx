"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import type { Message, Conversation, Property, Booking } from "@/generated/prisma/client";

type CleaningAlertRow = {
  id: string;
  summary: string;
  recipientName: string | null;
  recipientEmail: string | null;
  status: string;
  createdAt: Date;
};

interface ConversationViewProps {
  conversation: Conversation & {
    property: Property;
    booking: Booking | null;
    messages: Message[];
  };
  cleaningAlerts?: CleaningAlertRow[];
}

export function ConversationView({ conversation, cleaningAlerts = [] }: ConversationViewProps) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const draftMessage = conversation.messages.find((m) => m.status === "AI_DRAFT");

  async function sendMessage(content: string, messageId?: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/${conversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, messageId }),
      });
      if (!res.ok) throw new Error();
      setReply("");
      router.refresh();
      toast.success("Message sent");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {cleaningAlerts.length > 0 && (
        <div className="border-b border-teal-200 bg-teal-50 px-6 py-3">
          <div className="flex items-start gap-2">
            <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
            <div>
              <p className="text-sm font-medium text-teal-900">Cleaning team in the loop</p>
              <p className="mt-0.5 text-xs text-teal-800">
                {cleaningAlerts[0].recipientName ?? "Cleaning team"}
                {cleaningAlerts[0].recipientEmail
                  ? ` (${cleaningAlerts[0].recipientEmail})`
                  : ""}{" "}
                was notified when the guest reported this issue — same time as you.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {conversation.messages.map((msg) => {
          if (msg.isSystemMessage) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="max-w-[90%] rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-center">
                  <Badge variant="success" className="mb-1">
                    Host + cleaning team
                  </Badge>
                  <p className="text-xs text-teal-900">{msg.content}</p>
                  <p className="mt-1 text-[10px] text-teal-700/70">
                    {formatDateTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${msg.isFromGuest ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.isFromGuest
                    ? "rounded-tl-sm bg-neutral-100 text-neutral-900"
                    : "rounded-tr-sm bg-neutral-900 text-white"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  {msg.aiGenerated && <Badge variant="accent">AI</Badge>}
                  {msg.status === "AI_DRAFT" && <Badge variant="warning">Draft</Badge>}
                  {msg.status === "ESCALATED" && <Badge variant="danger">Escalated</Badge>}
                </div>
                <p className="text-sm">{msg.content}</p>
                <p className="mt-1 text-xs opacity-60">{formatDateTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {draftMessage && (
        <div className="border-t border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-medium text-amber-800">AI suggested reply</p>
          <p className="mt-1 text-sm text-amber-900">{draftMessage.content}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => sendMessage(draftMessage.content, draftMessage.id)}>
              Approve & send
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReply(draftMessage.content)}
            >
              Edit
            </Button>
          </div>
        </div>
      )}

      <div className="border-t border-neutral-200 bg-white p-4">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          rows={3}
        />
        <Button
          className="mt-2"
          disabled={!reply.trim() || loading}
          onClick={() => sendMessage(reply)}
        >
          Send reply
        </Button>
      </div>
    </div>
  );
}
