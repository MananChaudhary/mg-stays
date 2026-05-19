"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type PropertyDeleteSectionProps = {
  propertyId: string;
  propertyName: string;
  bookingCount?: number;
};

export function PropertyDeleteSection({
  propertyId,
  propertyName,
  bookingCount = 0,
}: PropertyDeleteSectionProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [loading, setLoading] = useState(false);

  const nameMatches = confirmName.trim() === propertyName;

  async function handleDelete() {
    if (!nameMatches) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete");
      toast.success("Property deleted");
      router.push("/dashboard/properties");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete property");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setExpanded(false);
    setConfirmName("");
  }

  return (
    <section className="rounded-2xl border border-red-200/80 bg-gradient-to-b from-red-50/80 to-white p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-red-950">Delete property</h2>
          <p className="mt-1 text-sm text-red-900/70">
            Permanently remove <strong className="font-medium text-red-950">{propertyName}</strong>{" "}
            from your account. This cannot be undone.
          </p>
          {bookingCount > 0 && (
            <p className="mt-2 text-sm text-red-800/80">
              Also deletes {bookingCount} booking{bookingCount === 1 ? "" : "s"} and related guest
              messages.
            </p>
          )}
        </div>
      </div>

      {!expanded ? (
        <Button
          type="button"
          variant="outline"
          className="mt-5 border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
          onClick={() => setExpanded(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete this property…
        </Button>
      ) : (
        <div className="mt-5 space-y-4 rounded-xl border border-red-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-neutral-600">
            Type the property name below to confirm deletion:
          </p>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={propertyName}
            autoComplete="off"
            className="border-red-100 focus-visible:ring-red-200"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={!nameMatches || loading}
              onClick={handleDelete}
            >
              {loading ? "Deleting…" : "Permanently delete"}
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
