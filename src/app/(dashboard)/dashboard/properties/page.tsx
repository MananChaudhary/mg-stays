import Link from "next/link";
import { Plus, Plug } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { PropertiesPageContent } from "@/components/properties/properties-page-content";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PropertiesPage() {
  const user = await getCurrentDbUser();
  const properties = await db.property.findMany({
    where: { ownerId: user?.id ?? "" },
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <DashboardHeader
        title="Properties"
        description="Manual listings and imports from Airbnb, Hostaway & other platforms"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/integrations">
                <Plug className="h-4 w-4" />
                Import from platform
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/properties/new">
                <Plus className="h-4 w-4" />
                Add manually
              </Link>
            </Button>
          </div>
        }
      />
      <div className="p-8">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white py-16">
            <p className="max-w-md text-center text-neutral-500">
              No properties yet. Connect Airbnb or Hostaway to import listings, or add a property
              manually.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/integrations">Connect a platform</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/properties/new">Add manually</Link>
              </Button>
            </div>
          </div>
        ) : (
          <PropertiesPageContent properties={properties} />
        )}
      </div>
    </>
  );
}
