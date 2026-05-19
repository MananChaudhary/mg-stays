import { IntegrationPlatform, MessageChannel } from "@/generated/prisma/client";

export type ImportedProperty = {
  name: string;
  address: string;
  city: string;
  country?: string;
  description?: string;
  externalListingId: string;
  wifiName?: string;
  wifiPassword?: string;
  checkInInstructions?: string;
  parkingInstructions?: string;
  houseRules?: string;
  checkoutInstructions?: string;
  buildingAccess?: string;
  amenities?: string[];
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  /** Demo nightly rate (AUD) for revenue on synced bookings */
  nightlyRate?: number;
};

export type PlatformConfig = {
  label: string;
  source: string;
  channel: MessageChannel;
  description: string;
  color: string;
  slug: string;
  properties: ImportedProperty[];
};

export const PLATFORM_CONFIG: Record<IntegrationPlatform, PlatformConfig> = {
  [IntegrationPlatform.AIRBNB]: {
    label: "Airbnb Host Account",
    source: "airbnb",
    channel: MessageChannel.AIRBNB,
    description: "Import Airbnb listings, reservations & guest messages",
    color: "bg-[#FF5A5F]",
    slug: "airbnb",
    properties: [
      {
        name: "Harbour View Apartment",
        address: "88 Circular Quay, Sydney NSW 2000",
        city: "Sydney",
        country: "Australia",
        description: "Stunning harbour views · 2BR · Self check-in",
        externalListingId: "airbnb-4829103",
        nightlyRate: 285,
        wifiName: "Harbour-Guest-5G",
        wifiPassword: "SydneyStay2024",
        checkInInstructions:
          "Check-in 3pm. Smart lock code sent 2h before arrival. Building access via fob in lockbox.",
        parkingInstructions: "1 secure garage spot — Level B2 #47. Fob in lockbox.",
        houseRules: "No parties · Quiet 10pm–8am · No smoking · Max 4 guests",
        amenities: ["WiFi", "Kitchen", "Washer", "Air conditioning", "Harbour view"],
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        name: "Bondi Beach Studio",
        address: "12 Campbell Parade, Bondi Beach NSW 2026",
        city: "Sydney",
        country: "Australia",
        description: "Steps from Bondi Beach · Studio · Ocean breeze",
        externalListingId: "airbnb-7738291",
        nightlyRate: 195,
        wifiName: "BondiStudio-Guest",
        wifiPassword: "BeachLife99",
        checkInInstructions: "Check-in 2pm. Keys in lockbox beside front door — code 7712.",
        parkingInstructions: "Street parking on Campbell Pde — permit included on dashboard.",
        houseRules: "No parties · Surfers welcome · Rinse sandy feet outside",
        amenities: ["WiFi", "Kitchenette", "Beach gear", "AC"],
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
        bedrooms: 0,
        bathrooms: 1,
      },
      {
        name: "Melbourne Laneway Loft",
        address: "42 Hosier Lane, Melbourne VIC 3000",
        city: "Melbourne",
        country: "Australia",
        description: "Iconic laneway location · Industrial loft",
        externalListingId: "airbnb-9910234",
        nightlyRate: 220,
        wifiName: "LanewayLoft",
        wifiPassword: "MelbCoffee24",
        checkInInstructions: "Enter via graffiti alley door — code 4455. Elevator to level 4.",
        amenities: ["WiFi", "Kitchen", "Workspace", "Coffee machine"],
        images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
        bedrooms: 1,
        bathrooms: 1,
      },
    ],
  },
  [IntegrationPlatform.HOSTAWAY]: {
    label: "Hostaway PMS",
    source: "hostaway",
    channel: MessageChannel.HOSTAWAY,
    description: "Sync all listings from Hostaway (Airbnb, Vrbo, Booking.com)",
    color: "bg-[#1a56db]",
    slug: "hostaway",
    properties: [
      {
        name: "Brisbane River View — Hostaway",
        address: "1 Eagle Street, Brisbane QLD 4000",
        city: "Brisbane",
        country: "Australia",
        description: "Managed via Hostaway · Channels: Airbnb + Booking.com",
        externalListingId: "hostaway-prop-10042",
        wifiName: "RiverView-Guest",
        wifiPassword: "Brisbane2024",
        checkInInstructions: "Hostaway automated message: Check-in 3pm. Smart lock active.",
        parkingInstructions: "Visitor parking Level 3 — register plate at concierge.",
        houseRules: "Standard Hostaway house rules apply · No events",
        amenities: ["WiFi", "Pool", "Gym", "Concierge"],
        images: ["https://images.unsplash.com/photo-1545324418-cc68a1d0d330?w=800"],
        bedrooms: 2,
        bathrooms: 2,
      },
      {
        name: "Gold Coast Beach House",
        address: "88 Surf Parade, Surfers Paradise QLD 4217",
        city: "Gold Coast",
        country: "Australia",
        description: "Hostaway listing · Family beach house · Multi-channel",
        externalListingId: "hostaway-prop-10089",
        wifiName: "GC-Beach-House",
        wifiPassword: "SurfParadise!",
        checkInInstructions: "Key safe on side gate — code in Hostaway pre-arrival message.",
        parkingInstructions: "Double garage — fits 2 cars.",
        amenities: ["WiFi", "Pool", "BBQ", "Beach access", "Kids room"],
        images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"],
        bedrooms: 4,
        bathrooms: 2,
      },
      {
        name: "Adelaide Hills Cottage",
        address: "15 Stirling Road, Stirling SA 5152",
        city: "Adelaide",
        country: "Australia",
        description: "Wine region retreat · Hostaway calendar sync",
        externalListingId: "hostaway-prop-10156",
        wifiName: "HillsCottage",
        wifiPassword: "WineCountry88",
        checkInInstructions: "Self check-in. Wood fireplace instructions in welcome book.",
        amenities: ["WiFi", "Fireplace", "Garden", "Wine fridge"],
        images: ["https://images.unsplash.com/photo-1518780664697-55e3ad933be7?w=800"],
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        name: "Perth City Apartment",
        address: "200 Hay Street, Perth WA 6000",
        city: "Perth",
        country: "Australia",
        description: "CBD apartment synced from Hostaway",
        externalListingId: "hostaway-prop-10201",
        wifiName: "PerthCBD-Guest",
        wifiPassword: "WestCoast24",
        checkInInstructions: "Front desk check-in 2pm–8pm. After hours: lockbox at lobby.",
        amenities: ["WiFi", "Gym", "Pool", "City views"],
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
        bedrooms: 1,
        bathrooms: 1,
      },
    ],
  },
  [IntegrationPlatform.BOOKING_COM]: {
    label: "Booking.com Extranet",
    source: "booking_com",
    channel: MessageChannel.BOOKING_COM,
    description: "Import Booking.com properties & reservations",
    color: "bg-[#003580]",
    slug: "booking-com",
    properties: [
      {
        name: "Sydney CBD Hotel Suite",
        address: "200 George Street, Sydney NSW 2000",
        city: "Sydney",
        country: "Australia",
        externalListingId: "booking-882910",
        wifiName: "CitySuite-WiFi",
        wifiPassword: "WelcomeGuest",
        checkInInstructions: "Reception check-in from 2pm. Room key at front desk.",
        amenities: ["WiFi", "Room service", "Gym"],
        images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"],
      },
    ],
  },
  [IntegrationPlatform.VRBO]: {
    label: "Vrbo Host Dashboard",
    source: "vrbo",
    channel: MessageChannel.VRBO,
    description: "Import Vrbo vacation rental listings",
    color: "bg-[#3D5A80]",
    slug: "vrbo",
    properties: [
      {
        name: "Byron Bay Coastal Home",
        address: "5 Ocean Drive, Byron Bay NSW 2481",
        city: "Byron Bay",
        country: "Australia",
        externalListingId: "vrbo-772019",
        wifiName: "Byron-Coastal",
        wifiPassword: "ByronBay2024",
        checkInInstructions: "Welcome guide in kitchen. Check-in 4pm.",
        parkingInstructions: "Driveway fits 3 cars.",
        amenities: ["WiFi", "Pool", "Outdoor shower", "Surfboards"],
        images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"],
      },
    ],
  },
  [IntegrationPlatform.WHATSAPP]: {
    label: "WhatsApp Business",
    source: "whatsapp",
    channel: MessageChannel.WHATSAPP,
    description: "Route WhatsApp guest messages to your inbox",
    color: "bg-[#25D366]",
    slug: "whatsapp",
    properties: [],
  },
};

export function parsePlatformSlug(raw: string): IntegrationPlatform | null {
  const normalized = raw.toLowerCase().replace(/-/g, "_");
  for (const [platform, config] of Object.entries(PLATFORM_CONFIG)) {
    if (config.slug === raw.toLowerCase() || config.slug.replace("-", "_") === normalized) {
      return platform as IntegrationPlatform;
    }
  }
  const upper = raw.toUpperCase().replace(/-/g, "_");
  if (Object.values(IntegrationPlatform).includes(upper as IntegrationPlatform)) {
    return upper as IntegrationPlatform;
  }
  return null;
}

export const ALL_PLATFORMS = Object.values(IntegrationPlatform);
