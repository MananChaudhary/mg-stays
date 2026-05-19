import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { ClientForm } from "@/components/clients/client-form";
import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  const client = await db.client.findFirst({
    where: { id, ownerId: user?.id ?? "" },
    include: { properties: true },
  });

  if (!client) notFound();

  return (
    <>
      <DashboardHeader title={client.name} description="Edit client and property assignments" />
      <div className="p-8">
        <ClientForm client={client} />
      </div>
    </>
  );
}
