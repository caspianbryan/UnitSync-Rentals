import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/auth(.*)",
  "/invite(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware({
  
  afterAuth: (req) => {
    if (!isPublicRoute(req)) {
      return;
    }
  },
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};