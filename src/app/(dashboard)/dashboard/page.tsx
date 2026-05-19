import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardAnalytics } from "@/components/dashboard/dashboard-analytics";
import { Button } from "@/components/ui/button";
import { QuickStart } from "@/components/dashboard/quick-start";
import { getCurrentDbUser } from "@/lib/auth";
import { isOwner } from "@/lib/roles";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ access?: string }>;
}) {
  const { access } = await searchParams;
  const user = await getCurrentDbUser();
  const owner = user ? isOwner(user.role as import("@/lib/roles").DashboardRole) : false;

  const stats = user ? await getDashboardStats(user.id) : null;

  const [conversations, notifications] = await Promise.all([
    db.conversation.findMany({
      where: { property: { ownerId: user?.id ?? "" }, isResolved: false },
      include: {
        property: true,
        booking: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      take: 5,
    }),
    db.notification.findMany({
      where: { userId: user?.id ?? "", read: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const hasProperties = (stats?.propertyCount ?? 0) > 0;

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description={`Welcome back${user?.firstName ? `, ${user.firstName}` : ""}`}
        action={
          <Button asChild>
            <Link href="/dashboard/properties/new">Add property</Link>
          </Button>
        }
      />
      <div className="space-y-8 p-8">
        {access === "limited" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            That section is only available to the MG Stays owner account.
          </div>
        )}
        <QuickStart hasProperties={hasProperties} isOwner={owner} />

        {stats && <DashboardAnalytics stats={stats} isOwner={owner} />}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Active guest chats</h2>
              <Link href="/dashboard/messages" className="text-sm text-amber-700 hover:underline">
                Open inbox
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {conversations.length === 0 ? (
                <p className="text-sm text-neutral-500">No active conversations.</p>
              ) : (
                conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/dashboard/messages/${conv.id}`}
                    className="block rounded-xl border border-neutral-100 p-4 transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {conv.booking?.guestName ?? "Guest"} · {conv.property.name}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-sm text-neutral-500">
                      {conv.messages[0]?.content ?? "No messages yet"}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neutral-500" />
              <h2 className="font-semibold">Notifications</h2>
            </div>
            <div className="mt-4 space-y-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-neutral-500">You&apos;re all caught up.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start justify-between rounded-lg bg-neutral-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-neutral-500">{n.message}</p>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
