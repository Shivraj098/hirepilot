import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;

  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup");

  const isProtected =
    pathname.startsWith("/dashboard");

  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/signin", "/signup"],
};