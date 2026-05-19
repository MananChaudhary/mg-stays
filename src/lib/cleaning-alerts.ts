import type { Property } from "@/generated/prisma/client";
import { MessageStatus, NotificationType } from "@/generated/prisma/client";
import { db } from "./db";

const CLEANING_KEYWORDS = [
  "clean",
  "cleaning",
  "cleaned",
  "dirty",
  "dust",
  "dusty",
  "hair",
  "stain",
  "smell",
  "odour",
  "odor",
  "mop",
  "vacuum",
  "trash",
  "rubbish",
  "bin",
  "bathroom",
  "toilet",
  "sheet",
  "linen",
  "towel",
  "housekeeping",
  "housekeeper",
  "maid",
  "hygiene",
  "mould",
  "mold",
  "grime",
  "filthy",
  "unclean",
];

const COMPLAINT_SIGNALS = [
  "not done",
  "wasn't done",
  "wasnt done",
  "not proper",
  "not properly",
  "still dirty",
  "still not",
  "hadn't been",
  "hadnt been",
  "wasn't cleaned",
  "wasnt cleaned",
  "not cleaned",
  "issue",
  "problem",
  "complaint",
  "disappointed",
  "unacceptable",
  "terrible",
  "awful",
  "bad job",
  "poor job",
  "missed",
  "forgot",
  "left",
];

export function isCleaningComplaint(message: string) {
  const q = message.toLowerCase();
  const hasCleaningTopic = CLEANING_KEYWORDS.some((term) => q.includes(term));
  const hasComplaint = COMPLAINT_SIGNALS.some((term) => q.includes(term));
  return hasCleaningTopic && hasComplaint;
}

export function buildCleaningAlertSummary(params: {
  propertyName: string;
  guestName: string;
  guestMessage: string;
  checkIn?: Date;
  checkOut?: Date;
}) {
  const stay =
    params.checkIn && params.checkOut
      ? ` · Stay ${params.checkIn.toLocaleDateString("en-AU")} – ${params.checkOut.toLocaleDateString("en-AU")}`
      : "";
  return `Guest ${params.guestName} at ${params.propertyName}${stay}: "${params.guestMessage.trim()}"`;
}

export type CleaningTeamContact = {
  name: string | null;
  email: string | null;
  phone: string | null;
};

export function getCleaningTeam(property: Pick<
  Property,
  "cleaningTeamName" | "cleaningTeamEmail" | "cleaningTeamPhone"
>): CleaningTeamContact | null {
  const email = property.cleaningTeamEmail?.trim() || null;
  const phone = property.cleaningTeamPhone?.trim() || null;
  const name = property.cleaningTeamName?.trim() || null;
  if (!email && !phone) return null;
  return { name, email, phone };
}

/** Demo delivery — logs outbound alert; swap for email/SMS provider in production */
async function deliverCleaningAlert(payload: {
  to: CleaningTeamContact;
  propertyName: string;
  summary: string;
}) {
  const recipient = payload.to.email ?? payload.to.phone ?? "unknown";
  console.info("[cleaning-alert] Sent to cleaning team:", {
    recipient,
    team: payload.to.name,
    property: payload.propertyName,
    summary: payload.summary,
  });
}

export async function handleCleaningComplaint(params: {
  property: Property & { ownerId: string };
  booking: { id: string; guestName: string; checkIn: Date; checkOut: Date };
  conversationId: string;
  guestMessage: string;
}) {
  const team = getCleaningTeam(params.property);
  const summary = buildCleaningAlertSummary({
    propertyName: params.property.name,
    guestName: params.booking.guestName,
    guestMessage: params.guestMessage,
    checkIn: params.booking.checkIn,
    checkOut: params.booking.checkOut,
  });

  const status = team ? "SENT" : "NO_TEAM_CONFIGURED";

  const alert = await db.cleaningAlert.create({
    data: {
      propertyId: params.property.id,
      bookingId: params.booking.id,
      conversationId: params.conversationId,
      guestMessage: params.guestMessage,
      summary,
      status,
      recipientName: team?.name,
      recipientEmail: team?.email,
      recipientPhone: team?.phone,
    },
  });

  if (team) {
    await deliverCleaningAlert({
      to: team,
      propertyName: params.property.name,
      summary,
    });
  }

  const teamLabel = team
    ? [team.name, team.email].filter(Boolean).join(" · ")
    : "No cleaning team configured for this property";

  const systemContent = team
    ? `Cleaning team notified (${teamLabel}). They received the guest's message at the same time as you.`
    : `Cleaning issue flagged — add a cleaning team on the property to auto-notify them. Guest message: "${params.guestMessage.slice(0, 120)}${params.guestMessage.length > 120 ? "…" : ""}"`;

  await db.message.create({
    data: {
      conversationId: params.conversationId,
      content: systemContent,
      isFromGuest: false,
      isSystemMessage: true,
      status: MessageStatus.SENT,
    },
  });

  await db.notification.create({
    data: {
      userId: params.property.ownerId,
      title: team ? "Cleaning issue · team notified" : "Cleaning issue · needs team setup",
      message: summary.slice(0, 200),
      type: NotificationType.CLEANING,
      link: `/dashboard/messages/${params.conversationId}`,
    },
  });

  return { alert, teamConfigured: !!team };
}

export function cleaningReplyForGuest(propertyName: string, teamConfigured: boolean) {
  if (teamConfigured) {
    return `I'm sorry to hear the cleaning wasn't up to standard at ${propertyName}. I've immediately notified your host and our cleaning team so they can re-attend as a priority. Someone will follow up with you shortly.`;
  }
  return `I'm sorry to hear about the cleaning at ${propertyName}. I've alerted your host right away and they'll arrange for the cleaning team to re-attend. Thank you for letting us know.`;
}
