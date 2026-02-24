import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();

  const url = req.nextUrl.pathname;

  // 🟢 Public routes
  const isPublic =
    url === "/" ||
    url.startsWith("/sign-in") ||
    url.startsWith("/sign-up") ||
    url.startsWith("/pricing");

  if (isPublic) {
    return NextResponse.next();
  }

  // 🔒 Protected app routes
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // ✅ Authenticated, allow through
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
  ],
};
