import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  PrismaClient,
  UserRole,
  BookingStatus,
  NotificationType,
} from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const demoClerkId = "user_demo_mgstays_seed";

  const user = await prisma.user.upsert({
    where: { clerkId: demoClerkId },
    update: {},
    create: {
      clerkId: demoClerkId,
      email: "demo@mgstays.com",
      firstName: "Demo",
      lastName: "Host",
      role: UserRole.ADMIN,
    },
  });

  const demoClient = await prisma.client.upsert({
    where: { id: "demo-client-mitchell" },
    update: {},
    create: {
      id: "demo-client-mitchell",
      name: "Mitchell Properties",
      email: "sarah@mitchellproperties.demo",
      company: "Mitchell Properties Pty Ltd",
      ownerId: user.id,
    },
  });

  const property = await prisma.property.upsert({
    where: { id: "demo-property-loft" },
    update: {
      clientId: demoClient.id,
      cleaningTeamName: "Sparkle Clean Co",
      cleaningTeamEmail: "dispatch@sparkleclean.demo",
      cleaningTeamPhone: "+61 400 111 222",
    },
    create: {
      id: "demo-property-loft",
      name: "The Loft · Downtown",
      address: "42 Collins Street, Melbourne VIC 3000",
      city: "Melbourne",
      country: "Australia",
      description: "A stunning modern loft in the heart of Melbourne CBD.",
      checkInInstructions:
        "Check-in is from 3pm. Use the lockbox on the front door — code 4829. Keys are inside.",
      wifiName: "MG-Loft-Guest",
      wifiPassword: "StayComfortable2024",
      parkingInstructions:
        "One reserved spot in underground garage — Level B2, spot #47. Use the fob in the lockbox.",
      houseRules:
        "No parties · Quiet hours 10pm–8am · No smoking · Max 4 guests · Please treat the space with care",
      checkoutInstructions:
        "Checkout by 11am. Leave keys in lockbox, take rubbish to chute on level 1, and lock the door.",
      buildingAccess: "Enter via main lobby. Elevator to level 12. Unit 1204.",
      emergencyContacts: "Host: +61 400 000 000 · Building security: +61 3 9000 0000",
      cleaningTeamName: "Sparkle Clean Co",
      cleaningTeamEmail: "dispatch@sparkleclean.demo",
      cleaningTeamPhone: "+61 400 111 222",
      localRecommendations:
        "Coffee: Patricia Coffee (5 min walk) · Dinner: Chin Chin (10 min) · Walk: Royal Botanic Gardens",
      amenities: ["WiFi", "Air conditioning", "Kitchen", "Washer", "Netflix", "City views"],
      images: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      ],
      faqs: [
        { q: "Is there a washing machine?", a: "Yes, in the laundry cupboard off the kitchen." },
        { q: "Can I check in early?", a: "Early check-in may be available — message us to check." },
      ],
      source: "manual",
      ownerId: user.id,
      clientId: demoClient.id,
    },
  });

  const booking = await prisma.booking.upsert({
    where: { id: "demo-booking-sarah" },
    update: {
      totalAmount: 720,
      currency: "AUD",
      platform: "direct",
    },
    create: {
      id: "demo-booking-sarah",
      guestName: "Sarah Mitchell",
      guestEmail: "sarah@example.com",
      checkIn: new Date(),
      checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: BookingStatus.CHECKED_IN,
      welcomeMessage: "Welcome Sarah! We're thrilled to host you at The Loft. Enjoy your stay!",
      propertyId: property.id,
      platform: "direct",
      totalAmount: 720,
      currency: "AUD",
    },
  });

  await prisma.conversation.upsert({
    where: { bookingId: booking.id },
    update: {},
    create: {
      propertyId: property.id,
      bookingId: booking.id,
      subject: "Stay for Sarah Mitchell",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "New booking",
        message: "Sarah Mitchell checked in at The Loft · Downtown",
        type: NotificationType.BOOKING,
        link: "/dashboard/bookings",
      },
      {
        userId: user.id,
        title: "AI handled guest question",
        message: "WiFi password question answered automatically",
        type: NotificationType.MESSAGE,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete!");
  console.log(`Guest stay page: /stay/${booking.id}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
