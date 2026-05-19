import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { ClientAirbnbSection } from "@/components/clients/client-airbnb-section";
import { ClientForm } from "@/components/clients/client-form";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { IntegrationPlatform } from "@/generated/prisma/client";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  const client = await db.client.findFirst({
    where: { id, ownerId: user?.id ?? "" },
    include: {
      properties: true,
      integrations: {
        where: { platform: IntegrationPlatform.AIRBNB },
      },
    },
  });

  if (!client) notFound();

  const airbnbIntegration = client.integrations[0] ?? null;

  return (
    <>
      <DashboardHeader title={client.name} description="Edit client and property assignments" />
      <div className="space-y-6 p-8">
        <ClientAirbnbSection
          clientId={client.id}
          clientName={client.name}
          integration={airbnbIntegration}
        />
        <ClientForm client={client} />
      </div>
    </>
  );
}
