"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";

export function Hero() {
  return (
    <section className="hero-gradient relative overflow-hidden pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm text-amber-800">
            <Sparkles className="h-4 w-4" />
            AI-powered guest communication
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
            Hospitality that feels{" "}
            <span className="gradient-text">effortless</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
            MG Stays helps Airbnb and short-stay hosts automate guest messaging,
            deliver premium digital stays, and manage every property from one
            beautiful dashboard.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SignUpButton mode="modal">
              <Button size="lg" className="gap-2">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </SignUpButton>
            <Button variant="outline" size="lg" asChild>
              <a href="#demo">Book a demo</a>
            </Button>
          </div>
          <p className="mt-4 text-sm text-neutral-500">
            No credit card required · 14-day free trial
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/50">
            <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-neutral-500">dashboard.mgstays.com</span>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <DashboardStat label="Properties" value="12" change="+2" />
              <DashboardStat label="Active chats" value="8" change="AI handling 6" />
              <DashboardStat label="Guest satisfaction" value="4.9" change="★★★★★" />
            </div>
            <div className="grid gap-4 border-t border-neutral-100 p-6 md:grid-cols-2">
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-xs font-medium text-neutral-500">Recent message</p>
                <p className="mt-2 text-sm text-neutral-800">
                  &ldquo;What&apos;s the WiFi password?&rdquo;
                </p>
                <p className="mt-2 text-xs text-amber-700">AI replied in 3s ✓</p>
              </div>
              <div className="rounded-xl bg-neutral-50 p-4">
                <p className="text-xs font-medium text-neutral-500">Upcoming check-in</p>
                <p className="mt-2 text-sm font-medium text-neutral-800">The Loft · Downtown</p>
                <p className="text-xs text-neutral-500">Today, 3:00 PM · Sarah M.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function DashboardStat({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{change}</p>
    </div>
  );
}
