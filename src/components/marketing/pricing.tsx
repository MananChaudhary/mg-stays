"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";

const plans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for hosts with 1–3 properties",
    features: [
      "Up to 3 properties",
      "AI guest assistant",
      "Digital stay pages",
      "Unified inbox",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$79",
    description: "For growing operators and managers",
    features: [
      "Up to 15 properties",
      "Everything in Starter",
      "AI draft approval workflow",
      "Team access (coming soon)",
      "Priority support",
      "Analytics dashboard",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large portfolios and agencies",
    features: [
      "Unlimited properties",
      "Custom integrations",
      "Dedicated account manager",
      "SLA & onboarding",
      "API access",
      "White-label options",
    ],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-neutral-600">
            Start free for 14 days. Scale as your portfolio grows.
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card-hover rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-xl"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className={`mt-1 text-sm ${plan.highlighted ? "text-neutral-400" : "text-neutral-500"}`}>
                {plan.description}
              </p>
              <p className="mt-6">
                <span className="text-4xl font-semibold">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span className={`text-sm ${plan.highlighted ? "text-neutral-400" : "text-neutral-500"}`}>
                    /month
                  </span>
                )}
              </p>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className={`h-4 w-4 ${plan.highlighted ? "text-amber-400" : "text-neutral-900"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {plan.name === "Enterprise" ? (
                  <Button
                    variant={plan.highlighted ? "secondary" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <a href="#demo">Contact sales</a>
                  </Button>
                ) : (
                  <SignUpButton mode="modal">
                    <Button
                      variant={plan.highlighted ? "secondary" : "default"}
                      className="w-full"
                    >
                      Start free trial
                    </Button>
                  </SignUpButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
