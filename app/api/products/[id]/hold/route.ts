import { NextRequest, NextResponse } from "next/server";
import { createHold } from "@/lib/server/db";
import { randomLatency, shouldFail } from "@/lib/server/simulate";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionId = req.headers.get("x-session-id");
  if (!sessionId) {
    return NextResponse.json({ code: "SERVER", message: "Missing session." }, { status: 400 });
  }

  await randomLatency(300, 900);

  if (shouldFail(0.08)) {
    return NextResponse.json(
      { code: "SERVER", message: "Couldn't reach the reservation service. Try again." },
      { status: 503 }
    );
  }

  let quantity = 1;
  try {
    const body = await req.json();
    if (typeof body?.quantity === "number" && body.quantity > 0) quantity = Math.floor(body.quantity);
  } catch {
    // no body, default to 1
  }

  const result = createHold(params.id, quantity, sessionId);

  if (!result.ok) {
    if (result.reason === "NOT_FOUND") {
      return NextResponse.json({ code: "NOT_FOUND", message: "That product doesn't exist." }, { status: 404 });
    }
    return NextResponse.json(
      { code: "OUT_OF_STOCK", message: "Someone else just grabbed the last one." },
      { status: 409 }
    );
  }

  return NextResponse.json(result.hold);
}
