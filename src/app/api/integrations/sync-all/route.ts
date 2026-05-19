import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth";
import { syncAllConnectedPlatforms } from "@/lib/integrations";

export async function POST() {
  try {
    const user = await requireOwner();
    const result = await syncAllConnectedPlatforms(user.id);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 }
    );
  }
}
