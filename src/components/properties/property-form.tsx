"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PropertyDeleteSection } from "@/components/properties/property-delete-section";
import { toast } from "sonner";
export type PropertyFormValues = {
  id: string;
  name: string;
  address: string;
  city: string | null;
  country: string | null;
  description: string | null;
  checkInInstructions: string | null;
  wifiName: string | null;
  wifiPassword: string | null;
  parkingInstructions: string | null;
  houseRules: string | null;
  checkoutInstructions: string | null;
  buildingAccess: string | null;
  emergencyContacts: string | null;
  localRecommendations: string | null;
  cleaningTeamName: string | null;
  cleaningTeamEmail: string | null;
  cleaningTeamPhone: string | null;
  amenities: string[];
  images: string[];
};

interface PropertyFormProps {
  property?: PropertyFormValues;
  bookingCount?: number;
}

export function PropertyForm({ property, bookingCount = 0 }: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const field = (name: string) => {
      const value = form.get(name);
      return typeof value === "string" ? value : "";
    };
    const amenities = field("amenities")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    const images = field("images")
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    const payload = {
      name: field("name").trim(),
      address: field("address").trim(),
      city: field("city").trim() || undefined,
      country: field("country").trim() || undefined,
      description: field("description").trim() || undefined,
      checkInInstructions: field("checkInInstructions").trim() || undefined,
      wifiName: field("wifiName").trim() || undefined,
      wifiPassword: field("wifiPassword").trim() || undefined,
      parkingInstructions: field("parkingInstructions").trim() || undefined,
      houseRules: field("houseRules").trim() || undefined,
      checkoutInstructions: field("checkoutInstructions").trim() || undefined,
      buildingAccess: field("buildingAccess").trim() || undefined,
      emergencyContacts: field("emergencyContacts").trim() || undefined,
      localRecommendations: field("localRecommendations").trim() || undefined,
      cleaningTeamName: field("cleaningTeamName").trim() || undefined,
      cleaningTeamEmail: field("cleaningTeamEmail").trim() || undefined,
      cleaningTeamPhone: field("cleaningTeamPhone").trim() || undefined,
      amenities,
      images,
    };

    try {
      const url = property
        ? `/api/properties/${property.id}`
        : "/api/properties";
      const res = await fetch(url, {
        method: property ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      toast.success(property ? "Property updated" : "Property created");
      const id = property?.id ?? data.id;
      if (id) {
        router.push(`/dashboard/properties/${id}`);
        router.refresh();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save property");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      key={property?.id ?? "new"}
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-8"
    >
      <section className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6">
        <h2 className="font-semibold">Basic information</h2>
        <Input name="name" placeholder="Property name" defaultValue={property?.name} required />
        <Input name="address" placeholder="Full address" defaultValue={property?.address} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="city" placeholder="City" defaultValue={property?.city ?? ""} />
          <Input name="country" placeholder="Country" defaultValue={property?.country ?? ""} />
        </div>
        <Textarea name="description" placeholder="Description" rows={3} defaultValue={property?.description ?? ""} />
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6">
        <h2 className="font-semibold">Guest instructions</h2>
        <Textarea name="checkInInstructions" placeholder="Check-in instructions" rows={4} defaultValue={property?.checkInInstructions ?? ""} />
        <Textarea name="checkoutInstructions" placeholder="Checkout instructions" rows={3} defaultValue={property?.checkoutInstructions ?? ""} />
        <Textarea name="buildingAccess" placeholder="Building access" rows={3} defaultValue={property?.buildingAccess ?? ""} />
        <Textarea name="parkingInstructions" placeholder="Parking instructions" rows={3} defaultValue={property?.parkingInstructions ?? ""} />
        <Textarea name="houseRules" placeholder="House rules" rows={4} defaultValue={property?.houseRules ?? ""} />
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6">
        <h2 className="font-semibold">WiFi & contacts</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="wifiName" placeholder="WiFi network name" defaultValue={property?.wifiName ?? ""} />
          <Input name="wifiPassword" placeholder="WiFi password" defaultValue={property?.wifiPassword ?? ""} />
        </div>
        <Textarea name="emergencyContacts" placeholder="Emergency contacts" rows={2} defaultValue={property?.emergencyContacts ?? ""} />
        <Textarea name="localRecommendations" placeholder="Local recommendations" rows={4} defaultValue={property?.localRecommendations ?? ""} />
        <Input name="amenities" placeholder="Amenities (comma-separated)" defaultValue={property?.amenities?.join(", ") ?? ""} />
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6">
        <h2 className="font-semibold">Cleaning team</h2>
        <p className="text-sm text-neutral-500">
          When a guest reports a cleaning issue, MG Stays notifies your host and this team at the
          same time.
        </p>
        <Input
          name="cleaningTeamName"
          placeholder="Team or company name"
          defaultValue={property?.cleaningTeamName ?? ""}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="cleaningTeamEmail"
            type="email"
            placeholder="Cleaning team email"
            defaultValue={property?.cleaningTeamEmail ?? ""}
          />
          <Input
            name="cleaningTeamPhone"
            placeholder="Cleaning team phone"
            defaultValue={property?.cleaningTeamPhone ?? ""}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6">
        <h2 className="font-semibold">Images</h2>
        <Textarea
          name="images"
          placeholder="Image URLs (one per line)"
          rows={3}
          defaultValue={property?.images?.join("\n") ?? ""}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-6">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : property ? "Save changes" : "Create property"}
        </Button>
        {property && (
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/properties">Back to properties</Link>
          </Button>
        )}
      </div>

      {property && (
        <PropertyDeleteSection
          propertyId={property.id}
          propertyName={property.name}
          bookingCount={bookingCount}
        />
      )}
    </form>
  );
}
