import "dotenv/config";
import { db } from "../src/lib/db.js";

async function main() {
  const user = await db.user.findFirst();
  if (!user) {
    console.log("No users in DB — dashboard needs Clerk sign-in + auto-sync");
    process.exit(0);
  }

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const [properties, bookings, conversations, aiLogs, notifications] =
    await Promise.all([
      db.property.count({ where: { ownerId: user.id } }),
      db.booking.findMany({
        where: { property: { ownerId: user.id } },
        include: { property: true },
        orderBy: { checkIn: "asc" },
        take: 5,
      }),
      db.conversation.findMany({
        where: { property: { ownerId: user.id }, isResolved: false },
        include: {
          property: true,
          booking: true,
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        take: 5,
      }),
      db.aIActivityLog.count({
        where: {
          property: { ownerId: user.id },
          createdAt: { gte: oneDayAgo },
        },
      }),
      db.notification.findMany({
        where: { userId: user.id, read: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  console.log("Dashboard queries OK:", {
    properties,
    bookings: bookings.length,
    conversations: conversations.length,
    aiLogs,
    notifications: notifications.length,
  });

  const integrations = await db.platformIntegration.findMany({
    where: { ownerId: user.id },
  });
  console.log("Integrations OK:", integrations.length);
}

main().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
