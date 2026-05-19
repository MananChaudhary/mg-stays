import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentDbUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  return (
    <DashboardShell role={user.role as import("@/lib/roles").DashboardRole}>
      {children}
    </DashboardShell>
  );
}
