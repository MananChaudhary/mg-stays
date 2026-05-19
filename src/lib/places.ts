import type { Property } from "@/generated/prisma/client";

export type NearbyPlace = {
  name: string;
  address: string;
  rating?: number;
  mapsUrl?: string;
  type?: string;
};

const LOCAL_INTENT =
  /\b(coffee|cafe|café|restaurant|food|eat|dining|bar|pub|brunch|lunch|dinner|breakfast|bakery|grocery|supermarket|pharmacy|chemist|atm|bank|beach|park|museum|things to do|attractions|shopping|store|pizza|sushi|wine|brewery)\b/i;

const NEARBY_INTENT =
  /\b(nearby|near me|near by|around here|close by|walking distance|around the area|local|recommend|suggestion|where can i|where should i|best place|good spot)\b/i;

export function isLocalDiscoveryQuery(message: string): boolean {
  const q = message.trim();
  if (!q) return false;
  return LOCAL_INTENT.test(q) || NEARBY_INTENT.test(q);
}

function propertyLocation(property: Property): string {
  return [property.address, property.city, property.country].filter(Boolean).join(", ");
}

function buildTextQuery(message: string, property: Property): string {
  const location = propertyLocation(property);
  const q = message.toLowerCase();
  if (q.includes("coffee") || q.includes("cafe") || q.includes("café")) {
    return `coffee shops near ${location}`;
  }
  if (q.includes("restaurant") || q.includes("food") || q.includes("eat") || q.includes("dinner") || q.includes("lunch")) {
    return `restaurants near ${location}`;
  }
  if (q.includes("grocery") || q.includes("supermarket")) {
    return `supermarkets near ${location}`;
  }
  if (q.includes("pharmacy") || q.includes("chemist")) {
    return `pharmacies near ${location}`;
  }
  if (q.includes("bar") || q.includes("pub") || q.includes("drinks")) {
    return `bars near ${location}`;
  }
  return `${message} near ${location}`;
}

/** Google Places API (New) — Text Search */
async function searchGooglePlaces(
  textQuery: string,
  apiKey: string
): Promise<NearbyPlace[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.rating,places.googleMapsUri,places.primaryType",
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: 5,
      languageCode: "en",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[places] Google API error:", res.status, err);
    return [];
  }

  const data = (await res.json()) as {
    places?: Array<{
      displayName?: { text?: string };
      formattedAddress?: string;
      rating?: number;
      googleMapsUri?: string;
      primaryType?: string;
    }>;
  };

  return (data.places ?? []).map((p) => ({
    name: p.displayName?.text ?? "Unknown",
    address: p.formattedAddress ?? "",
    rating: p.rating,
    mapsUrl: p.googleMapsUri,
    type: p.primaryType?.replace(/_/g, " "),
  }));
}

/** Demo suggestions when no Google API key (based on city) */
function demoPlacesForProperty(property: Property, message: string): NearbyPlace[] {
  const city = (property.city ?? "").toLowerCase();
  const q = message.toLowerCase();

  if (city.includes("melbourne") && (q.includes("coffee") || q.includes("cafe"))) {
    return [
      {
        name: "Patricia Coffee Brewers",
        address: "Corner of Little Bourke & Exhibition St, Melbourne",
        rating: 4.6,
        mapsUrl: "https://www.google.com/maps/search/Patricia+Coffee+Melbourne",
        type: "cafe",
      },
      {
        name: "Market Lane Coffee",
        address: "Shop 3/8 Collins St, Melbourne VIC 3000",
        rating: 4.5,
        mapsUrl: "https://www.google.com/maps/search/Market+Lane+Coffee+Melbourne",
        type: "cafe",
      },
      {
        name: "Dukes Coffee Roasters",
        address: "247 Flinders Ln, Melbourne VIC 3000",
        rating: 4.5,
        mapsUrl: "https://www.google.com/maps/search/Dukes+Coffee+Melbourne",
        type: "cafe",
      },
    ];
  }

  if (city.includes("sydney") && (q.includes("coffee") || q.includes("cafe"))) {
    return [
      {
        name: "Single O Surry Hills",
        address: "60-64 Reservoir St, Surry Hills NSW 2010",
        rating: 4.5,
        mapsUrl: "https://www.google.com/maps/search/Single+O+Sydney",
        type: "cafe",
      },
      {
        name: "Brewtown Newtown",
        address: "6-8 O'Connell St, Newtown NSW 2042",
        rating: 4.4,
        mapsUrl: "https://www.google.com/maps/search/Brewtown+Newtown",
        type: "cafe",
      },
    ];
  }

  return [];
}

export type PlacesContext = {
  source: "google" | "property" | "demo" | "none";
  places: NearbyPlace[];
  searchQuery?: string;
};

export async function fetchNearbyPlacesContext(
  property: Property,
  guestMessage: string
): Promise<PlacesContext> {
  if (!isLocalDiscoveryQuery(guestMessage)) {
    return { source: "none", places: [] };
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  const searchQuery = buildTextQuery(guestMessage, property);

  if (apiKey) {
    const places = await searchGooglePlaces(searchQuery, apiKey);
    if (places.length > 0) {
      return { source: "google", places, searchQuery };
    }
  }

  const demo = demoPlacesForProperty(property, guestMessage);
  if (demo.length > 0) {
    return { source: "demo", places: demo, searchQuery };
  }

  if (property.localRecommendations?.trim()) {
    return { source: "property", places: [], searchQuery };
  }

  return { source: "none", places: [], searchQuery };
}

export function formatPlacesForAI(ctx: PlacesContext, property: Property): string {
  if (ctx.source === "none") return "";

  if (ctx.source === "property" && property.localRecommendations) {
    return `
Nearby / local tips (from host):
${property.localRecommendations}
`.trim();
  }

  if (ctx.places.length === 0) return "";

  const sourceLabel =
    ctx.source === "google"
      ? "Google Maps (live nearby search)"
      : "Sample nearby places (add GOOGLE_PLACES_API_KEY for live results)";

  const lines = ctx.places.map((p, i) => {
    const parts = [
      `${i + 1}. ${p.name}`,
      p.address ? `   Address: ${p.address}` : "",
      p.rating ? `   Rating: ${p.rating}/5` : "",
      p.type ? `   Type: ${p.type}` : "",
      p.mapsUrl ? `   Maps: ${p.mapsUrl}` : "",
    ];
    return parts.filter(Boolean).join("\n");
  });

  return `
${sourceLabel}${ctx.searchQuery ? ` — query: "${ctx.searchQuery}"` : ""}
Use these real nearby results when recommending places. Mention names, ratings, and that guests can open the Maps link for directions. Do not invent other venues unless the host's local tips are also provided.

${lines.join("\n")}
`.trim();
}

export function formatPlacesReply(places: NearbyPlace[], source: PlacesContext["source"]): string {
  if (places.length === 0) return "";

  const intro =
    source === "google"
      ? "Here are some nearby spots from Google Maps:"
      : "Here are some popular spots in the area:";

  const list = places
    .map((p) => {
      const rating = p.rating ? ` (${p.rating}★)` : "";
      const link = p.mapsUrl ? `\n   Directions: ${p.mapsUrl}` : "";
      return `• ${p.name}${rating} — ${p.address}${link}`;
    })
    .join("\n");

  return `${intro}\n\n${list}`;
}
