import { DashboardHeader } from "@/components/dashboard/header";
import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <>
      <DashboardHeader title="Add client" description="Create a client and assign their properties" />
      <div className="p-8">
        <ClientForm />
      </div>
    </>
  );
}
