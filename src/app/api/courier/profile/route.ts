import { NextRequest, NextResponse } from "next/server";
import { normalizeCourierProfile } from "@/lib/courierProfile";

const COURIER_PROFILE_URL = `${process.env.API_BASE_URL}/api/v1/couriers/profile`;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "missing_authorization" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(COURIER_PROFILE_URL, {
      headers: {
        Authorization: authHeader,
      },
      next: { revalidate: 0 },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const normalized = normalizeCourierProfile(data);
    return NextResponse.json(normalized ?? data, { status: res.status });
  } catch (err) {
    console.error("Failed to load courier profile:", err);

    return NextResponse.json(
      {
        error: "network_error",
        error_description: "Unable to reach backend",
      },
      { status: 500 }
    );
  }
}
