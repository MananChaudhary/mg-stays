"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ClientData = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  properties?: { id: string; name: string }[];
};

export function ClientForm({ client }: { client?: ClientData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<{ id: string; name: string; clientId: string | null }[]>([]);
  const [selected, setSelected] = useState<string[]>(
    client?.properties?.map((p) => p.id) ?? []
  );

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then(setProperties)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      company: form.get("company"),
      notes: form.get("notes"),
      propertyIds: selected,
    };

    try {
      const url = client ? `/api/clients/${client.id}` : "/api/clients";
      const res = await fetch(url, {
        method: client ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(client ? "Client updated" : "Client created");
      router.push("/dashboard/clients");
      router.refresh();
    } catch {
      toast.error("Failed to save client");
    } finally {
      setLoading(false);
    }
  }

  function toggleProperty(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold">Client details</h2>
        <Input name="name" placeholder="Client name" defaultValue={client?.name} required />
        <Input name="company" placeholder="Company" defaultValue={client?.company ?? ""} />
        <Input name="email" type="email" placeholder="Email" defaultValue={client?.email ?? ""} />
        <Input name="phone" placeholder="Phone" defaultValue={client?.phone ?? ""} />
        <Textarea name="notes" placeholder="Notes" rows={3} defaultValue={client?.notes ?? ""} />
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Assign properties</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Link listings this client owns or manages
        </p>
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {properties.length === 0 ? (
            <p className="text-sm text-neutral-400">No properties yet. Add properties first.</p>
          ) : (
            properties.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-100 p-3 hover:bg-neutral-50"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(p.id)}
                  onChange={() => toggleProperty(p.id)}
                  className="rounded"
                />
                <span className="text-sm font-medium">{p.name}</span>
                {p.clientId && p.clientId !== client?.id && (
                  <span className="ml-auto text-xs text-amber-600">Assigned elsewhere</span>
                )}
              </label>
            ))
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : client ? "Update client" : "Create client"}
      </Button>
    </form>
  );
}
