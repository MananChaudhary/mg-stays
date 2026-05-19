"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Building2,
  Calendar,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plug,
  Settings,
  Users,
  X,
} from "lucide-react";
import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { canAccessNav, roleLabel, type DashboardRole, type NavItemId } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems: {
  id: NavItemId;
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}[] = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { id: "properties", href: "/dashboard/properties", label: "Properties", icon: Building2 },
  { id: "calendar", href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { id: "bookings", href: "/dashboard/bookings", label: "Bookings", icon: Calendar },
  { id: "messages", href: "/dashboard/messages", label: "Guest Messages", icon: MessageSquare },
  { id: "integrations", href: "/dashboard/integrations", label: "Integrations", icon: Plug },
  { id: "ai-assistant", href: "/dashboard/ai-assistant", label: "AI Assistant", icon: Bot },
  { id: "clients", href: "/dashboard/clients", label: "Clients", icon: Users },
  { id: "settings", href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  role: DashboardRole;
  onNavigate?: () => void;
  mobile?: boolean;
}

export function Sidebar({ role, onNavigate, mobile }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const visibleNav = navItems.filter((item) => canAccessNav(role, item.id));

  return (
    <aside className="flex h-full w-64 flex-col border-r border-neutral-800 bg-neutral-950 text-white">
      <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-6">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-neutral-900">
            MG
          </div>
          <span className="font-semibold">MG Stays</span>
        </Link>
        {mobile && onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="text-neutral-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleNav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-neutral-800 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-neutral-900 p-3">
          <UserButton
            appearance={{
              elements: { avatarBox: "h-9 w-9" },
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user?.firstName ?? user?.username ?? "Account"}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] uppercase">
                {roleLabel(role)}
              </Badge>
            </div>
          </div>
        </div>

        <SignOutButton redirectUrl="/">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </SignOutButton>

        <Link
          href="/"
          onClick={onNavigate}
          className="block text-center text-xs text-neutral-500 hover:text-neutral-300"
        >
          ← Back to website
        </Link>
      </div>
    </aside>
  );
}
