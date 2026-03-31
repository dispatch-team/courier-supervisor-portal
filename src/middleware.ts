import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES: Record<string, string> = {
  "/merchant": "/login/merchant",
  "/supervisor": "/login/supervisor",
  "/admin": "/login/admin",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const matchedPrefix = Object.keys(PROTECTED_ROUTES).find(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (!matchedPrefix) return NextResponse.next();

  const accessToken = request.cookies.get("dispatch_access_token")?.value;

  if (!accessToken) {
    // No token — check localStorage via a client-side redirect approach
    // Since middleware can't read localStorage, we use a thin client wrapper
    // that checks auth state. For now, allow through — AuthGuard handles it.
    return NextResponse.next();
  }

  // Validate token expiry (basic check without verifying signature)
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (Date.now() >= payload.exp * 1000) {
      return NextResponse.redirect(new URL(PROTECTED_ROUTES[matchedPrefix], request.url));
    }
  } catch {
    return NextResponse.redirect(new URL(PROTECTED_ROUTES[matchedPrefix], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/merchant/:path*", "/supervisor/:path*", "/admin/:path*"],
};
