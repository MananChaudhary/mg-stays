"use client";

import { Check } from "lucide-react";

const capabilities = [
  "Answers WiFi, parking, and check-in questions instantly",
  "Uses your property's stored information — never guesses",
  "Friendly, hospitality-focused tone guests love",
  "Escalates urgent issues to you automatically",
  "Learns from your FAQs and house rules",
  "Available 24/7 during every guest stay",
];

export function AISection() {
  return (
    <section id="ai" className="bg-neutral-900 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-amber-400">AI Guest Communication</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your 24/7 concierge that knows every property
            </h2>
            <p className="mt-4 text-neutral-400">
              MG Stays AI reads your property details — WiFi, parking, house rules,
              local tips — and responds like your best team member. When it can&apos;t
              help, it escalates to you instantly.
            </p>
            <ul className="mt-8 space-y-3">
              {capabilities.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-neutral-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
            <div className="space-y-4">
              <ChatBubble from="guest" message="Hi! What's the WiFi password?" />
              <ChatBubble
                from="ai"
                message="Welcome! The WiFi network is 'MG-Loft-Guest' and the password is 'StayComfortable2024'. Let me know if you need anything else!"
              />
              <ChatBubble from="guest" message="Where can I park?" />
              <ChatBubble
                from="ai"
                message="You have one reserved spot in the underground garage — Level B2, spot #47. Use the fob in the lockbox for garage access."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ from, message }: { from: "guest" | "ai"; message: string }) {
  const isAI = from === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
          isAI
            ? "rounded-tl-sm bg-neutral-800 text-neutral-200"
            : "rounded-tr-sm bg-amber-600 text-white"
        }`}
      >
        {isAI && (
          <p className="mb-1 text-xs font-medium text-amber-400">MG AI · 3s</p>
        )}
        {message}
      </div>
    </div>
  );
}
