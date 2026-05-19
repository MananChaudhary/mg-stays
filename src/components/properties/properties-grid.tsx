"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, MapPin, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertySourceBadge } from "./property-source-badge";
import { toast } from "sonner";

type PropertyRow = {
  id: string;
  name: string;
  address: string;
  city: string | null;
  source: string;
  isActive: boolean;
  images: string[];
  _count: { bookings: number };
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "manual", label: "Manual" },
  { id: "airbnb", label: "Airbnb" },
  { id: "hostaway", label: "Hostaway" },
  { id: "booking_com", label: "Booking.com" },
  { id: "vrbo", label: "Vrbo" },
] as const;

export function PropertiesGrid({ properties }: { properties: PropertyRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return properties;
    return properties.filter((p) => (p.source || "manual") === filter);
  }, [properties, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: properties.length };
    for (const p of properties) {
      const s = p.source || "manual";
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [properties]);

  async function handleDelete(property: PropertyRow) {
    const bookingNote =
      property._count.bookings > 0
        ? `\n\nThis will also delete ${property._count.bookings} booking(s) and related messages.`
        : "";

    const confirmed = window.confirm(
      `Delete "${property.name}"? This cannot be undone.${bookingNote}`
    );
    if (!confirmed) return;

    setDeletingId(property.id);
    try {
      const res = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to delete");
      toast.success("Property deleted");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete property");
    } finally {
      setDeletingId(null);
    }
  }

  function cardBody(property: PropertyRow) {
    return (
      <>
        <div className="relative h-40 bg-neutral-100">
          {property.images[0] ? (
            <Image src={property.images[0]} alt={property.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <MapPin className="h-8 w-8" />
            </div>
          )}
          {deleteMode && (
            <button
              type="button"
              aria-label={`Delete ${property.name}`}
              disabled={deletingId === property.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete(property);
              }}
              className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold">{property.name}</h3>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <PropertySourceBadge source={property.source} />
              <Badge variant={property.isActive ? "success" : "secondary"}>
                {property.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
            <MapPin className="h-3 w-3" />
            {property.address}
            {property.city ? `, ${property.city}` : ""}
          </p>
          <p className="mt-3 text-xs text-neutral-400">
            {property._count.bookings} bookings
            {!deleteMode && (
              <span className="text-neutral-500"> · Tap to edit details</span>
            )}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = f.id === "all" ? counts.all : counts[f.id] ?? 0;
            if (f.id !== "all" && count === 0) return null;
            return (
              <Button
                key={f.id}
                size="sm"
                variant={filter === f.id ? "default" : "outline"}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </Button>
            );
          })}
        </div>
        <Button
          type="button"
          size="sm"
          variant={deleteMode ? "default" : "outline"}
          className={deleteMode ? "bg-red-600 hover:bg-red-700" : ""}
          onClick={() => setDeleteMode((on) => !on)}
        >
          {deleteMode ? (
            <>
              <Check className="h-4 w-4" />
              Done
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete properties
            </>
          )}
        </Button>
      </div>

      {deleteMode && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <strong>Delete mode.</strong> Tap the red trash icon on a property to remove it. Tap{" "}
          <strong>Done</strong> when finished. To edit WiFi, rules, or other details, tap{" "}
          <strong>Done</strong> first, then tap the property card.
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">No properties in this category.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((property) => (
            <div
              key={property.id}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow ${
                deleteMode
                  ? "border-red-200 ring-1 ring-red-100"
                  : "border-neutral-100 hover:shadow-md"
              }`}
            >
              {deleteMode ? (
                <div className="block">{cardBody(property)}</div>
              ) : (
                <Link
                  href={`/dashboard/properties/${property.id}`}
                  className="block transition-colors hover:bg-neutral-50/80"
                >
                  {cardBody(property)}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
