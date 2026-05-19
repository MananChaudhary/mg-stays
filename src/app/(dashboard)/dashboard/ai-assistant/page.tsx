"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

type Log = {
  id: string;
  action: string;
  query: string | null;
  response: string | null;
  escalated: boolean;
  confidence: number | null;
  createdAt: string;
  property: { id: string; name: string };
};

const SAMPLE_QUESTIONS = [
  "What's the WiFi password?",
  "Where can I park?",
  "What time is check-in?",
  "Any good coffee nearby?",
];

export default function AIAssistantPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [testMessage, setTestMessage] = useState("");
  const [testReply, setTestReply] = useState("");
  const [testing, setTesting] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [aiMode, setAiMode] = useState<"claude" | "demo">("demo");
  const [placesMode, setPlacesMode] = useState<"google" | "demo">("demo");
  const [loadingSample, setLoadingSample] = useState(false);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/logs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setLogs(data.logs ?? []);
      setBookingId(data.sampleBookingId ?? "");
      setPropertyId(data.samplePropertyId ?? "");
      setAiMode(data.aiMode === "claude" ? "claude" : "demo");
      setPlacesMode(data.placesMode === "google" ? "google" : "demo");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load AI — sign in and add a property");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch logs on mount
    void loadLogs();
  }, []);

  async function loadSampleData() {
    setLoadingSample(true);
    try {
      const res = await fetch("/api/onboarding", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Sample data loaded");
      await loadLogs();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load sample data");
    } finally {
      setLoadingSample(false);
    }
  }

  async function testAI(message?: string) {
    const text = (message ?? testMessage).trim();
    if (!text) {
      toast.error("Enter a question to test");
      return;
    }
    if (!bookingId) {
      toast.error("No property yet — load sample data or add a property first");
      return;
    }
    setTesting(true);
    setTestReply("");
    if (message) setTestMessage(message);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "AI request failed");
      setTestReply(data.reply);
      toast.success(aiMode === "claude" ? "Claude responded" : "Demo AI responded");
      await loadLogs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI test failed");
    } finally {
      setTesting(false);
    }
  }

  const stats = {
    total: logs.length,
    escalated: logs.filter((l) => l.escalated).length,
    avgConfidence:
      logs.length > 0
        ? Math.round(
            (logs.reduce((s, l) => s + (l.confidence ?? 0), 0) / logs.length) * 100
          )
        : 0,
  };

  const guestStayUrl = bookingId
    ? `/stay/${bookingId}`
    : propertyId
      ? `/stay/preview/${propertyId}`
      : null;

  return (
    <>
      <DashboardHeader
        title="AI Assistant"
        description="Test the guest concierge and review AI activity"
      />
      <div className="space-y-6 p-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-neutral-700">AI engine:</span>
            <Badge variant={aiMode === "claude" ? "success" : "secondary"}>
              {aiMode === "claude" ? "Claude (live)" : "Demo mode (no API key)"}
            </Badge>
            <span className="text-sm font-medium text-neutral-700">Nearby places:</span>
            <Badge variant={placesMode === "google" ? "success" : "secondary"}>
              {placesMode === "google" ? "Google Maps (live)" : "Host tips + demo"}
            </Badge>
          </div>
          {placesMode === "demo" && (
            <p className="mt-2 text-sm text-neutral-600">
              Add <code className="rounded bg-neutral-100 px-1">GOOGLE_PLACES_API_KEY</code> to{" "}
              <code className="rounded bg-neutral-100 px-1">.env</code> for live café, restaurant,
              and attraction search. Without it, the AI uses host tips and sample listings for
              Melbourne/Sydney.
            </p>
          )}
          {aiMode === "demo" && (
            <p className="mt-2 text-sm text-neutral-600">
              Add <code className="rounded bg-neutral-100 px-1">ANTHROPIC_API_KEY</code> to your{" "}
              <code className="rounded bg-neutral-100 px-1">.env</code> file and restart{" "}
              <code className="rounded bg-neutral-100 px-1">npm run dev</code> for full Claude
              responses. Demo mode still answers WiFi, parking, and check-in from your property
              data.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          <p className="font-semibold">How to test AI (2 ways)</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              <strong>Here:</strong> type a question below and click Test AI
            </li>
            <li>
              <strong>As a guest:</strong> open the stay page → <strong>AI Concierge</strong> tab
              {guestStayUrl && (
                <>
                  {" "}
                  (
                  <Link href={guestStayUrl} target="_blank" className="underline">
                    open stay page
                  </Link>
                  )
                </>
              )}
            </li>
          </ol>
          {!bookingId && (
            <Button
              size="sm"
              className="mt-3"
              onClick={loadSampleData}
              disabled={loadingSample}
            >
              {loadingSample ? "Loading…" : "Load sample data to test"}
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Total interactions</p>
            <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Escalations</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">{stats.escalated}</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">Avg confidence</p>
            <p className="mt-1 text-2xl font-semibold">{stats.avgConfidence}%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Test AI concierge</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {bookingId
              ? "Uses your property WiFi, check-in, and house rules from the database."
              : "Add a property or load sample data to enable testing."}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q) => (
              <Button
                key={q}
                type="button"
                size="sm"
                variant="outline"
                disabled={!bookingId || testing}
                onClick={() => testAI(q)}
              >
                {q}
              </Button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              testAI();
            }}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="e.g. What's the WiFi password?"
              className="flex-1"
              disabled={!bookingId}
            />
            <Button type="submit" disabled={testing || !bookingId}>
              {testing ? "Thinking…" : "Test AI"}
            </Button>
          </form>
          {testReply && (
            <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-800 whitespace-pre-wrap">
              {testReply}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-6 py-4">
            <h2 className="font-semibold">Activity log</h2>
          </div>
          {loading ? (
            <p className="p-6 text-sm text-neutral-500">Loading…</p>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-neutral-500">No AI activity yet. Run a test above.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{log.property.name}</p>
                      <Badge variant={log.escalated ? "danger" : "success"}>
                        {log.escalated ? "Escalated" : log.action}
                      </Badge>
                    </div>
                    {log.query && (
                      <p className="mt-1 text-sm text-neutral-600">Q: {log.query}</p>
                    )}
                    {log.response && (
                      <p className="mt-1 truncate text-xs text-neutral-400">A: {log.response}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-neutral-400">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
