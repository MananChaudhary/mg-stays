"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Building2,
  MessageSquare,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Guest Assistant",
    description:
      "Answers WiFi, parking, check-in, and local questions instantly using your property details.",
  },
  {
    icon: MessageSquare,
    title: "Unified Inbox",
    description:
      "All guest conversations in one place. Review AI drafts, edit, and send with one click.",
  },
  {
    icon: Building2,
    title: "Property Hub",
    description:
      "Store instructions, amenities, FAQs, and images for every listing in a single source of truth.",
  },
  {
    icon: Smartphone,
    title: "Digital Stay Pages",
    description:
      "Beautiful guest-facing pages with everything they need — no app download required.",
  },
  {
    icon: Zap,
    title: "Smart Automations",
    description:
      "Automated welcome messages, check-in reminders, and checkout instructions.",
  },
  {
    icon: Shield,
    title: "Escalation & Alerts",
    description:
      "AI escalates urgent issues to you instantly. Never miss what matters.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything hosts need, nothing they don&apos;t
          </h2>
          <p className="mt-4 text-neutral-600">
            Built for operators managing one property or fifty. Scale without
            sacrificing guest experience.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-hover rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
