"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { addDays, toDateInputValue } from "@/lib/calendar-utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProps, setLoadingProps] = useState(true);

  const defaultPropertyId = searchParams.get("propertyId") ?? "";
  const defaultCheckIn = searchParams.get("checkIn") ?? "";
  const defaultCheckOut = defaultCheckIn
    ? toDateInputValue(addDays(new Date(defaultCheckIn + "T12:00:00"), 3))
    : "";

  useEffect(() => {
    fetch("/api/properties")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return Array.isArray(data) ? data : [];
      })
      .then(setProperties)
      .catch(() => setProperties([]))
      .finally(() => setLoadingProps(false));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: form.get("propertyId"),
          guestName: form.get("guestName"),
          guestEmail: form.get("guestEmail"),
          guestPhone: form.get("guestPhone"),
          checkIn: form.get("checkIn"),
          checkOut: form.get("checkOut"),
          welcomeMessage: form.get("welcomeMessage"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success("Booking created!");
      router.push("/dashboard/bookings");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loadingProps ? (
        <p className="text-neutral-500">Loading properties...</p>
      ) : properties.length === 0 ? (
        <div className="max-w-lg rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center">
          <p className="text-neutral-600">Add a property before creating a booking.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/properties/new">Add property</Link>
          </Button>
        </div>
      ) : (
        <form
            key={`${defaultPropertyId}-${defaultCheckIn}`}
            onSubmit={handleSubmit}
            className="max-w-lg space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Property
              </label>
              <select
                name="propertyId"
                required
                defaultValue={defaultPropertyId}
                className="flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="">Select property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Input name="guestName" placeholder="Guest name *" required />
            <Input name="guestEmail" type="email" placeholder="Guest email" />
            <Input name="guestPhone" placeholder="Guest phone" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Check-in
                </label>
                <Input name="checkIn" type="date" required defaultValue={defaultCheckIn} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Check-out
                </label>
                <Input name="checkOut" type="date" required defaultValue={defaultCheckOut} />
              </div>
            </div>
            <Textarea
              name="welcomeMessage"
              placeholder="Custom welcome message (optional)"
              rows={3}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create booking & stay page"}
            </Button>
          </form>
      )}
    </>
  );
}

export default function NewBookingPage() {
  return (
    <>
      <DashboardHeader title="New booking" description="Create a guest stay and share their stay page" />
      <div className="p-8">
        <Suspense fallback={<p className="text-neutral-500">Loading…</p>}>
          <NewBookingForm />
        </Suspense>
      </div>
    </>
  );
}
