import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  const { pathname } = req.nextUrl;

  // Public routes
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/pricing");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If not signed in → redirect to sign in
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Signed in → allow
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};