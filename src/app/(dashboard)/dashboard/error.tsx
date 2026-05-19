"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  const isDb =
    error.message.includes("DATABASE_URL") ||
    error.message.includes("Prisma") ||
    error.message.includes("findMany");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-neutral-600">
        {isDb
          ? "The database connection or Prisma client needs a refresh. This usually fixes it:"
          : "An unexpected error occurred loading this page."}
      </p>
      {isDb && (
        <pre className="mt-4 max-w-lg overflow-x-auto rounded-xl bg-neutral-100 p-4 text-left text-xs text-neutral-700">
          {`# Terminal 1\nnpx prisma dev\n\n# Terminal 2\nrm -rf .next && npm run dev`}
        </pre>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
