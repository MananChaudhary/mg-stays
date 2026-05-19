import { notFound } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { PropertyForm } from "@/components/properties/property-form";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  const property = await db.property.findFirst({
    where: { id, ownerId: user?.id ?? "" },
    include: { _count: { select: { bookings: true } } },
  });

  if (!property) notFound();

  const propertyForForm = {
    id: property.id,
    name: property.name,
    address: property.address,
    city: property.city,
    country: property.country,
    description: property.description,
    checkInInstructions: property.checkInInstructions,
    wifiName: property.wifiName,
    wifiPassword: property.wifiPassword,
    parkingInstructions: property.parkingInstructions,
    houseRules: property.houseRules,
    checkoutInstructions: property.checkoutInstructions,
    buildingAccess: property.buildingAccess,
    emergencyContacts: property.emergencyContacts,
    localRecommendations: property.localRecommendations,
    cleaningTeamName: property.cleaningTeamName,
    cleaningTeamEmail: property.cleaningTeamEmail,
    cleaningTeamPhone: property.cleaningTeamPhone,
    amenities: property.amenities,
    images: property.images,
  };

  return (
    <>
      <DashboardHeader
        title="Edit property"
        description={property.name}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/properties">All properties</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/stay/preview/${property.id}`} target="_blank">
                Preview guest page
              </Link>
            </Button>
          </div>
        }
      />
      <div className="p-8">
        <PropertyForm property={propertyForForm} bookingCount={property._count.bookings} />
      </div>
    </>
  );
}
