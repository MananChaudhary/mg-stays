"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "MG Stays cut our response time from hours to seconds. Guests love the instant answers, and we finally have time to focus on growing.",
    author: "Sarah Mitchell",
    role: "Host, 8 properties · Melbourne",
    avatar: "SM",
  },
  {
    quote:
      "The digital stay page alone was worth it. No more repeating WiFi passwords. The AI handles 80% of messages without us lifting a finger.",
    author: "James Chen",
    role: "Property Manager · Sydney",
    avatar: "JC",
  },
  {
    quote:
      "We manage 24 listings across three cities. MG Stays is the first tool that actually feels built for scale — clean, fast, and premium.",
    author: "Elena Rodriguez",
    role: "Operations Director · StayCo",
    avatar: "ER",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-neutral-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Loved by hosts worldwide
          </h2>
        </motion.div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm"
            >
              <p className="text-neutral-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.author}</p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
