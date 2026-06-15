import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth"];

function hasSessionCookie(req: NextRequest): boolean {
  return Boolean(
    req.cookies.get("authjs.session-token") ||
      req.cookies.get("__Secure-authjs.session-token") ||
      req.cookies.get("next-auth.session-token") ||
      req.cookies.get("__Secure-next-auth.session-token"),
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes.
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Let API route handlers own their auth/permission checks.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (!hasSessionCookie(req)) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|aeroflow-logo.png).*)"],
};
