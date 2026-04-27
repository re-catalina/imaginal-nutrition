import { NextResponse } from "next/server";

/** Anonymous multi-user demo removed — use NextAuth session + GET /api/me instead. */

export async function GET() {
  return NextResponse.json({ error: "Deprecated: use GET /api/me while signed in." }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: "Deprecated: sign in with credentials." }, { status: 410 });
}
