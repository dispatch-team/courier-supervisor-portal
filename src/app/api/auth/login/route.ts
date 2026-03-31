import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL!;

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Username and password are required." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/couriers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const raw = await res.text();
    let data: unknown;
    try { data = JSON.parse(raw); } catch { data = {}; }

    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "network_error", error_description: "Unable to reach backend" },
      { status: 500 }
    );
  }
}
