import { NextRequest, NextResponse } from "next/server";

import { getMobileCompatibleSession } from "@/shared/api/mobile-auth";
import { syncWorkoutSessionAction } from "@/features/workout-session/actions/sync-workout-sessions.action";

function getSyncErrorStatus(error: string) {
  if (error.includes("User") && error.includes("not found")) {
    return 404;
  }

  if (error.includes("Exercises not found")) {
    return 400;
  }

  return 500;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getMobileCompatibleSession(request);

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.session) {
      return NextResponse.json({ error: "Session data is required" }, { status: 400 });
    }

    // Use the existing server action
    const result = await syncWorkoutSessionAction({ session: body.session });

    if (result?.serverError) {
      return NextResponse.json({ error: result.serverError }, { status: 500 });
    }

    if (result?.validationErrors) {
      return NextResponse.json({ error: "INVALID_INPUT", details: result.validationErrors }, { status: 400 });
    }

    if (result?.data?.serverError) {
      return NextResponse.json({ error: result.data.serverError }, { status: getSyncErrorStatus(result.data.serverError) });
    }

    if (result?.data?.data) {
      return NextResponse.json({
        success: true,
        data: result.data.data
      });
    }

    console.error("Failed to sync session", JSON.stringify(result, null, 2));
    return NextResponse.json({ error: "Failed to sync session" }, { status: 500 });
  } catch (error) {
    console.error("Error in workout session sync:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
