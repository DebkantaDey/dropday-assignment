import { NextRequest, NextResponse } from "next/server";
import { listHolds } from "@/lib/server/db";
import { randomLatency } from "@/lib/server/simulate";

export async function GET(req: NextRequest) {
  const sessionId = req.headers.get("x-session-id");
  if (!sessionId) return NextResponse.json([], { status: 200 });

  await randomLatency(120, 350);
  return NextResponse.json(listHolds(sessionId));
}
