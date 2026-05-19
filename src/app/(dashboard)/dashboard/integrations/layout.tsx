import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { isOwner } from "@/lib/roles";

export default async function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (!isOwner(user.role as import("@/lib/roles").DashboardRole)) redirect("/dashboard?access=limited");
  return children;
}
