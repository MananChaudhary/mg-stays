import { db } from "../db";
import type { ImportedProperty } from "./platforms";

export async function upsertImportedProperty(
  ownerId: string,
  p: ImportedProperty,
  source: string,
  clientId?: string | null
) {
  const existing = await db.property.findFirst({
    where: { ownerId, externalListingId: p.externalListingId },
  });

  const data = {
    name: p.name,
    address: p.address,
    city: p.city,
    country: p.country ?? "Australia",
    description: p.description,
    wifiName: p.wifiName,
    wifiPassword: p.wifiPassword,
    checkInInstructions: p.checkInInstructions,
    parkingInstructions: p.parkingInstructions,
    houseRules: p.houseRules,
    checkoutInstructions: p.checkoutInstructions,
    buildingAccess: p.buildingAccess,
    amenities: p.amenities ?? ["WiFi"],
    images: p.images ?? [],
    source,
    externalPlatform: source,
    externalListingId: p.externalListingId,
    lastSyncedAt: new Date(),
    isActive: true,
    ...(clientId ? { clientId } : {}),
  };

  if (existing) {
    return {
      property: await db.property.update({ where: { id: existing.id }, data }),
      created: false,
    };
  }

  return {
    property: await db.property.create({ data: { ...data, ownerId } }),
    created: true,
  };
}
