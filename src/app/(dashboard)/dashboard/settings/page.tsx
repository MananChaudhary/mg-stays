import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@clerk/nextjs";
import { getCurrentDbUser } from "@/lib/auth";
import { isOwner, roleLabel } from "@/lib/roles";

export default async function SettingsPage() {
  const user = await getCurrentDbUser();
  const owner = user ? isOwner(user.role as import("@/lib/roles").DashboardRole) : false;

  return (
    <>
      <DashboardHeader title="Settings" description="Manage your account and preferences" />
      <div className="space-y-8 p-8">
        <div className="max-w-2xl rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-neutral-500">Account type</span>
            <Badge variant={owner ? "success" : "secondary"}>
              {user ? roleLabel(user.role as import("@/lib/roles").DashboardRole) : "—"}
            </Badge>
          </div>
          {!owner && (
            <div className="mb-6 space-y-3 text-sm text-neutral-600">
              <p>
                You&apos;re signed in as a <strong>client</strong> — your own business workspace.
                Manage your listings, bookings, guest messages, and AI assistant from here.
              </p>
              <p className="text-neutral-500">
                Integrations (Airbnb, Hostaway) and the Clients directory are reserved for the MG
                Stays owner account. Sign in with the owner Google email to access those sections.
              </p>
            </div>
          )}
          {owner && (
            <p className="mb-4 text-sm text-neutral-600">
              Owner account — full platform access including integrations and client management.
            </p>
          )}
          <UserProfile />
        </div>

        {owner && (
          <div className="max-w-2xl rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Integrations</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Connect Airbnb, Hostaway, Booking.com, Vrbo, and WhatsApp.
            </p>
            <Link
              href="/dashboard/integrations"
              className="mt-4 inline-block text-sm font-medium text-amber-700 hover:underline"
            >
              Manage integrations →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
