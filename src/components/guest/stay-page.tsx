"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  ChevronRight,
  Key,
  LogOut,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Wifi,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Booking, Property } from "@/generated/prisma/client";

interface StayPageProps {
  booking: Booking & { property: Property };
}

const tabs = [
  { id: "essentials", label: "Essentials" },
  { id: "guide", label: "Stay guide" },
  { id: "concierge", label: "AI Concierge" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function StayPage({ booking }: StayPageProps) {
  const { property } = booking;
  const [activeTab, setActiveTab] = useState<TabId>("essentials");
  const [messages, setMessages] = useState<{ role: "guest" | "ai"; content: string }[]>([
    {
      role: "ai",
      content:
        booking.welcomeMessage ??
        `Welcome, ${booking.guestName}! I'm your MG Stays concierge for ${property.name}. Ask me anything about WiFi, parking, check-in, or local tips.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "concierge") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "guest", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, message: userMsg }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
    } catch {
      const wifiHint = property.wifiPassword
        ? `WiFi network "${property.wifiName}" — password "${property.wifiPassword}". `
        : "";
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            wifiHint +
            "You'll also find everything in the Stay guide tab. Your host is a message away if you need more help.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const essentials = [
    {
      icon: Wifi,
      title: "WiFi",
      highlight: property.wifiName,
      detail: property.wifiPassword ? `Password: ${property.wifiPassword}` : undefined,
    },
    {
      icon: Key,
      title: "Check-in",
      detail: property.checkInInstructions,
    },
    {
      icon: Car,
      title: "Parking",
      detail: property.parkingInstructions,
    },
    {
      icon: LogOut,
      title: "Checkout",
      detail: property.checkoutInstructions,
    },
  ].filter((e) => e.detail || e.highlight);

  return (
    <motion.div className="min-h-screen bg-[#fafafa]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative mx-auto max-w-3xl px-6 pt-10 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-white/80 px-4 py-1.5 text-sm text-amber-800 shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Your digital stay · MG Stays
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-xl shadow-neutral-200/40"
          >
            <div className="relative h-52 sm:h-64">
              {property.images[0] ? (
                <Image
                  src={property.images[0]}
                  alt={property.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
              )}
              <motion.div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <motion.div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-sm font-medium text-amber-300">
                  {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {property.name}
                </h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                  <MapPin className="h-3.5 w-3.5" />
                  {property.address}
                </p>
              </motion.div>
            </div>

            <motion.div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 px-6 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Guest
                </p>
                <p className="font-medium text-neutral-900">{booking.guestName}</p>
              </div>
              {property.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {property.amenities.slice(0, 4).map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl gap-1 px-6 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === "essentials" && (
            <motion.div
              key="essentials"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {essentials.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-hover rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 font-semibold text-neutral-900">{item.title}</h3>
                  {item.highlight && (
                    <p className="mt-1 text-lg font-medium text-neutral-800">{item.highlight}</p>
                  )}
                  {item.detail && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                      {item.detail}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "guide" && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {property.buildingAccess && (
                <GuideCard title="Building access" content={property.buildingAccess} />
              )}
              {property.houseRules && (
                <GuideCard title="House rules" content={property.houseRules} />
              )}
              {property.localRecommendations && (
                <GuideCard title="Local recommendations" content={property.localRecommendations} icon={MapPin} />
              )}
              {property.emergencyContacts && (
                <GuideCard title="Emergency contacts" content={property.emergencyContacts} icon={Phone} />
              )}
              <button
                type="button"
                onClick={() => setActiveTab("concierge")}
                className="flex w-full items-center justify-between rounded-2xl border border-neutral-900 bg-neutral-900 px-5 py-4 text-left text-white transition hover:bg-neutral-800"
              >
                <span className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-amber-400" />
                  <span>
                    <span className="block font-medium">Ask the AI concierge</span>
                    <span className="text-sm text-neutral-400">Instant answers, 24/7</span>
                  </span>
                </span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </motion.div>
          )}

          {activeTab === "concierge" && (
            <motion.div
              key="concierge"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg shadow-neutral-200/50"
            >
              <div className="border-b border-neutral-100 bg-gradient-to-r from-amber-50 to-white px-5 py-4">
                <motion.div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">AI Concierge</p>
                    <p className="text-xs text-neutral-500">Powered by Claude · knows this property</p>
                  </div>
                </motion.div>
              </div>

              <div className="h-[min(420px,55vh)] overflow-y-auto bg-neutral-50/50 p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "guest" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        msg.role === "guest"
                          ? "rounded-tr-md bg-neutral-900 text-white"
                          : "rounded-tl-md border border-neutral-100 bg-white text-neutral-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-md border border-neutral-100 bg-white px-4 py-3 text-sm text-neutral-400 shadow-sm">
                      <span className="inline-flex gap-1">
                        <span className="animate-bounce">·</span>
                        <span className="animate-bounce [animation-delay:0.1s]">·</span>
                        <span className="animate-bounce [animation-delay:0.2s]">·</span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={sendMessage}
                className="flex gap-2 border-t border-neutral-100 bg-white p-4"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about WiFi, parking, check-in..."
                  className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-neutral-800 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-10 text-center text-xs text-neutral-400">
          MG Stays · Intelligent hospitality
        </p>
      </div>
    </motion.div>
  );
}

function GuideCard({
  title,
  content,
  icon: Icon = Key,
}: {
  title: string;
  content: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-neutral-900">
        <Icon className="h-4 w-4 text-amber-600" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-600">{content}</p>
    </div>
  );
}
