import { getAirbnbOAuthConfig } from "./config";
import type { ImportedProperty } from "../platforms";

type AirbnbListingRaw = {
  id?: string | number;
  listing_id?: string | number;
  name?: string;
  title?: string;
  street?: string;
  apt?: string;
  city?: string;
  country_code?: string;
  country?: string;
  description?: string;
  wifi_network?: string;
  wifi_password?: string;
  check_in_instructions?: string;
  house_rules?: string;
  listing_photos?: Array<{ extra_large_url?: string; large_url?: string }>;
};

function pickListingsPayload(json: unknown): AirbnbListingRaw[] {
  if (!json || typeof json !== "object") return [];
  const root = json as Record<string, unknown>;
  if (Array.isArray(root.listings)) return root.listings as AirbnbListingRaw[];
  if (Array.isArray(root.data)) return root.data as AirbnbListingRaw[];
  if (root.listing && typeof root.listing === "object") {
    return [root.listing as AirbnbListingRaw];
  }
  return [];
}

export function mapAirbnbListingToProperty(listing: AirbnbListingRaw): ImportedProperty {
  const listingId = String(listing.id ?? listing.listing_id ?? "");
  const name = listing.name ?? listing.title ?? `Airbnb listing ${listingId}`;
  const addressParts = [listing.street, listing.apt].filter(Boolean);
  const images =
    listing.listing_photos
      ?.map((p) => p.extra_large_url ?? p.large_url)
      .filter((u): u is string => Boolean(u)) ?? [];

  return {
    name,
    address: addressParts.length > 0 ? addressParts.join(", ") : "Address from Airbnb",
    city: listing.city ?? "Unknown",
    country: listing.country ?? listing.country_code ?? "Australia",
    description: listing.description,
    externalListingId: `airbnb-${listingId}`,
    wifiName: listing.wifi_network,
    wifiPassword: listing.wifi_password,
    checkInInstructions: listing.check_in_instructions,
    houseRules: listing.house_rules,
    images,
    amenities: ["WiFi"],
  };
}

/**
 * Fetch host listings from Airbnb Homes API.
 * Exact path may vary by API version — adjust when your partner docs are issued.
 */
export async function fetchAirbnbListings(accessToken: string): Promise<ImportedProperty[]> {
  const { apiBaseUrl } = getAirbnbOAuthConfig();
  const endpoints = [`${apiBaseUrl}/listings`, `${apiBaseUrl}/managed_listings`];

  let lastError = "Could not load listings from Airbnb";

  for (const url of endpoints) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const json = await res.json().catch(() => ({}));

    if (res.ok) {
      const listings = pickListingsPayload(json);
      if (listings.length === 0) {
        lastError = "Airbnb connected but returned no listings for this host account";
        continue;
      }
      return listings.map(mapAirbnbListingToProperty);
    }

    const errBody = json as { error_message?: string; error?: string };
    lastError =
      errBody.error_message ??
      errBody.error ??
      `Airbnb API error ${res.status} at ${url}`;
  }

  throw new Error(lastError);
}
