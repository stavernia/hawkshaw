import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "hawkshaw",
    timestamp: new Date().toISOString(),
  });
}

