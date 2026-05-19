import { DashboardHeader } from "@/components/dashboard/header";
import { PropertyForm } from "@/components/properties/property-form";

export default function NewPropertyPage() {
  return (
    <>
      <DashboardHeader title="Add property" description="Create a new listing" />
      <div className="p-8">
        <PropertyForm />
      </div>
    </>
  );
}
