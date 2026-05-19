"use client";

import { motion } from "framer-motion";
import { Key, MapPin, MessageCircle, Wifi } from "lucide-react";

const steps = [
  {
    icon: Key,
    title: "Seamless check-in",
    description: "Guests receive personalized check-in instructions before arrival.",
  },
  {
    icon: Wifi,
    title: "Instant answers",
    description: "WiFi, parking, house rules — all accessible without messaging you.",
  },
  {
    icon: MapPin,
    title: "Local discovery",
    description: "Curated recommendations help guests explore like locals.",
  },
  {
    icon: MessageCircle,
    title: "AI concierge",
    description: "24/7 chat support that feels human, warm, and helpful.",
  },
];

export function ExperienceSection() {
  return (
    <section id="experience" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            A guest experience they&apos;ll remember
          </h2>
          <p className="mt-4 text-neutral-600">
            Every booking gets a beautiful digital stay page — your property&apos;s
            digital front door.
          </p>
        </motion.div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
