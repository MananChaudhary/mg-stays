import { NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { createStarterDataForUser } from "@/lib/onboarding";

export async function POST() {
  try {
    const user = await requireDbUser();
    const result = await createStarterDataForUser(user.id);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create sample data" },
      { status: 500 }
    );
  }
}
