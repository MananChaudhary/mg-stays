import {
  BookingStatus,
  MessageStatus,
  NotificationType,
} from "@/generated/prisma/client";
import { db } from "./db";

export async function createStarterDataForUser(userId: string) {
  const existing = await db.property.count({ where: { ownerId: userId } });
  if (existing > 0) {
    return { created: false, message: "User already has properties" };
  }

  const client = await db.client.create({
    data: {
      name: "Sample Client",
      email: "client@example.com",
      company: "Demo Properties Co",
      ownerId: userId,
    },
  });

  const property = await db.property.create({
    data: {
      name: "The Loft · Downtown",
      address: "42 Collins Street, Melbourne VIC 3000",
      city: "Melbourne",
      country: "Australia",
      description: "A stunning modern loft in the heart of Melbourne CBD.",
      checkInInstructions:
        "Check-in from 3pm. Lockbox on front door — code 4829. Keys inside.",
      wifiName: "MG-Loft-Guest",
      wifiPassword: "StayComfortable2024",
      parkingInstructions: "Underground garage Level B2, spot #47.",
      houseRules: "No parties · Quiet hours 10pm–8am · No smoking · Max 4 guests",
      checkoutInstructions: "Checkout by 11am. Leave keys in lockbox.",
      buildingAccess: "Main lobby, elevator to level 12, unit 1204.",
      emergencyContacts: "Host: +61 400 000 000",
      cleaningTeamName: "Sparkle Clean Co",
      cleaningTeamEmail: "dispatch@sparkleclean.demo",
      cleaningTeamPhone: "+61 400 111 222",
      localRecommendations: "Patricia Coffee · Chin Chin · Royal Botanic Gardens",
      amenities: ["WiFi", "Kitchen", "Air conditioning", "Washer"],
      images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
      source: "manual",
      ownerId: userId,
      clientId: client.id,
    },
  });

  const booking = await db.booking.create({
    data: {
      guestName: "Sarah Mitchell",
      guestEmail: "sarah@example.com",
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: BookingStatus.CHECKED_IN,
      welcomeMessage: "Welcome Sarah! Enjoy your stay at The Loft.",
      propertyId: property.id,
      platform: "direct",
      totalAmount: 720,
      currency: "AUD",
    },
  });

  const conversation = await db.conversation.create({
    data: {
      propertyId: property.id,
      bookingId: booking.id,
      subject: "Stay for Sarah Mitchell",
    },
  });

  await db.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        content: "Hi! What time is check-in?",
        isFromGuest: true,
        status: MessageStatus.SENT,
      },
      {
        conversationId: conversation.id,
        content:
          "Check-in is from 3pm. WiFi: MG-Loft-Guest / StayComfortable2024. Full details on your stay page!",
        isFromGuest: false,
        status: MessageStatus.AI_DRAFT,
        aiGenerated: true,
        aiConfidence: 0.9,
      },
    ],
  });

  await db.aIActivityLog.create({
    data: {
      propertyId: property.id,
      action: "reply",
      query: "What time is check-in?",
      response: "Check-in is from 3pm...",
      confidence: 0.9,
    },
  });

  await db.notification.create({
    data: {
      userId,
      title: "Welcome to MG Stays",
      message: "Your sample property and booking are ready. Explore the dashboard!",
      type: NotificationType.SYSTEM,
      link: "/dashboard/properties",
    },
  });

  return {
    created: true,
    propertyId: property.id,
    bookingId: booking.id,
    stayUrl: `/stay/${booking.id}`,
  };
}
