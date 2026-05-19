"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ContactSection() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          company: form.get("company"),
          message: form.get("message"),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Thanks! We'll be in touch within 24 hours.");
      e.currentTarget.reset();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="demo" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm lg:grid-cols-2 lg:p-12">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              See MG Stays in action
            </h2>
            <p className="mt-4 text-neutral-600">
              Book a personalized demo and see how MG Stays can transform your
              guest communication. Our team will walk you through the platform.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-neutral-600">
              <li>✓ 30-minute personalized walkthrough</li>
              <li>✓ Custom setup recommendations</li>
              <li>✓ No commitment required</li>
            </ul>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Your name" required />
            <Input name="email" type="email" placeholder="Email address" required />
            <Input name="company" placeholder="Company (optional)" />
            <Textarea name="message" placeholder="Tell us about your properties..." rows={4} required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Request demo"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
