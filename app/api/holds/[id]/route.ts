import { NextRequest, NextResponse } from "next/server";
import { releaseHold } from "@/lib/server/db";
import { randomLatency } from "@/lib/server/simulate";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionId = req.headers.get("x-session-id");
  if (!sessionId) {
    return NextResponse.json({ code: "SERVER", message: "Missing session." }, { status: 400 });
  }

  await randomLatency(150, 400);

  const result = releaseHold(params.id, sessionId);
  if (!result.ok) {
    return NextResponse.json(
      { code: "HOLD_NOT_FOUND", message: "That hold is already gone." },
      { status: 404 }
    );
  }
  return NextResponse.json(result.hold);
}
