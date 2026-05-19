import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ClientsPage() {
  const user = await getCurrentDbUser();
  const clients = await db.client.findMany({
    where: { ownerId: user?.id ?? "" },
    include: {
      properties: { select: { id: true, name: true, externalPlatform: true } },
      _count: { select: { properties: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <DashboardHeader
        title="Clients"
        description="Manage property owners and assign their listings"
        action={
          <Button asChild>
            <Link href="/dashboard/clients/new">
              <Plus className="h-4 w-4" />
              Add client
            </Link>
          </Button>
        }
      />
      <div className="p-8">
        {clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
            <p className="text-neutral-500">No clients yet</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/clients/new">Add your first client</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="card-hover rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
              >
                <p className="font-semibold text-neutral-900">{client.name}</p>
                {client.company && (
                  <p className="text-sm text-neutral-500">{client.company}</p>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
                  <Building2 className="h-4 w-4" />
                  {client._count.properties} properties
                </div>
                {client.properties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {client.properties.slice(0, 2).map((p) => (
                      <Badge key={p.id} variant="secondary" className="text-xs">
                        {p.name}
                      </Badge>
                    ))}
                    {client.properties.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{client.properties.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
