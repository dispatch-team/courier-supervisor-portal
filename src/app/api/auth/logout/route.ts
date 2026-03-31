import { NextRequest, NextResponse } from "next/server";
import { LOGOUT_URL, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } from "@/lib/keycloak.server";

export async function POST(request: NextRequest) {
  const { refresh_token } = await request.json();

  if (!refresh_token) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Refresh token is required." },
      { status: 400 }
    );
  }

  const res = await fetch(LOGOUT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      refresh_token,
    }),
  });

  if (res.ok || res.status === 204) {
    return NextResponse.json({ success: true });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
