"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Calendar,
  MessageSquare,
  Plug,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const steps = [
  {
    icon: Building2,
    title: "Add a property",
    description: "WiFi, check-in, parking, house rules",
    href: "/dashboard/properties/new",
    primary: true,
  },
  {
    icon: Calendar,
    title: "Create a booking",
    description: "Generate a guest stay page",
    href: "/dashboard/bookings/new",
  },
  {
    icon: Plug,
    title: "Connect Airbnb",
    description: "Sync listings & messages",
    href: "/dashboard/integrations",
  },
  {
    icon: Users,
    title: "Add a client",
    description: "Assign properties to clients",
    href: "/dashboard/clients/new",
  },
  {
    icon: MessageSquare,
    title: "Guest inbox",
    description: "Review AI message drafts",
    href: "/dashboard/messages",
  },
];

export function QuickStart({
  hasProperties,
  isOwner = false,
}: {
  hasProperties: boolean;
  isOwner?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function loadSampleData() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.created) {
        toast.success("Sample property, booking & messages loaded!");
        router.refresh();
      } else {
        toast.info("You already have properties");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load sample data");
    } finally {
      setLoading(false);
    }
  }

  if (hasProperties) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Get started with MG Stays</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Your dashboard is empty. Add a property or load sample data to explore every tab.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps
          .filter((step) => {
            if (isOwner) return true;
            return (
              step.href !== "/dashboard/integrations" &&
              step.href !== "/dashboard/clients/new"
            );
          })
          .map((step) => (
          <Link
            key={step.href}
            href={step.href}
            className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <step.icon className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" />
            <div>
              <p className="font-medium text-neutral-900">{step.title}</p>
              <p className="text-xs text-neutral-500">{step.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/properties/new">Add your first property</Link>
        </Button>
        <Button variant="outline" onClick={loadSampleData} disabled={loading}>
          {loading ? "Loading..." : "Load sample data"}
        </Button>
      </div>
    </div>
  );
}
