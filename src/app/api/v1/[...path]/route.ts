import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL!;

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = `${API_BASE}/api/v1/${path.join("/")}`;

  const url = new URL(target);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {};
  const auth = request.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const ct = contentType ?? "";
    init.body = ct.includes("multipart/")
      ? Buffer.from(await request.arrayBuffer())
      : await request.text();
  }

  try {
    const res = await fetch(url.toString(), init);

    // 204/205 must have no body — return immediately
    if (res.status === 204 || res.status === 205) {
      return new NextResponse(null, { status: res.status });
    }

    const contentType = res.headers.get("Content-Type") ?? "application/json";
    const isJson = contentType.includes("application/json") || contentType.includes("text/");

    const body = isJson ? await res.text() : await res.arrayBuffer();

    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { error: "network_error", message: "Unable to reach backend" },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
