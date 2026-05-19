"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#ai", label: "AI Assistant" },
  { href: "#experience", label: "Guest Experience" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Reviews" },
];

function AuthButtons({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Show when="signed-out">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sign-in" onClick={onNavigate}>
            Log in
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/sign-up" onClick={onNavigate}>
            Start free trial
          </Link>
        </Button>
      </Show>
      <Show when="signed-in">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" onClick={onNavigate}>
            Dashboard
          </Link>
        </Button>
        <UserButton />
      </Show>
    </>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="fixed top-0 z-50 w-full glass border-b border-neutral-200/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white">
            MG
          </div>
          <span className="text-lg font-semibold tracking-tight">MG Stays</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <AuthButtons />
        </div>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-neutral-200 bg-white px-6 py-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-neutral-600"
              onClick={close}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2 border-t border-neutral-100 pt-4">
            <AuthButtons onNavigate={close} />
          </div>
        </div>
      )}
    </header>
  );
}
