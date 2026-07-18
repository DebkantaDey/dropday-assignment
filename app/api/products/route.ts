import { NextResponse } from "next/server";
import { listProducts } from "@/lib/server/db";
import { randomLatency, shouldFail } from "@/lib/server/simulate";

export async function GET() {
  await randomLatency(200, 700);

  if (shouldFail(0.06)) {
    return NextResponse.json(
      { code: "SERVER", message: "The drop feed hiccupped. Try again." },
      { status: 503 }
    );
  }

  return NextResponse.json(listProducts());
}
