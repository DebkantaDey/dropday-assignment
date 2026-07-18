import { NextRequest, NextResponse } from "next/server";
import { checkout } from "@/lib/server/db";
import { randomLatency, shouldFail } from "@/lib/server/simulate";

export async function POST(req: NextRequest) {
  const sessionId = req.headers.get("x-session-id");
  if (!sessionId) {
    return NextResponse.json({ code: "SERVER", message: "Missing session." }, { status: 400 });
  }

  await randomLatency(400, 1100);

  if (shouldFail(0.05)) {
    return NextResponse.json(
      { code: "SERVER", message: "Checkout service timed out. Nothing was charged — try again." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const holdIds: string[] = Array.isArray(body?.holdIds) ? body.holdIds : [];

  const result = checkout(holdIds, sessionId);
  if (!result.ok) {
    if (result.reason === "EMPTY") {
      return NextResponse.json({ code: "NOT_FOUND", message: "No held items to check out." }, { status: 400 });
    }
    return NextResponse.json(
      {
        code: "HOLD_EXPIRED",
        message: "One or more holds expired before checkout completed.",
        expiredIds: result.expiredIds,
      },
      { status: 409 }
    );
  }

  return NextResponse.json(result.order);
}
