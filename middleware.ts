import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/auth/callback", "/test-db"];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // API routes - let them through
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // Protect routes - redirect to login if not authenticated
    if (!isPublicRoute && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from login page
    if (pathname === "/login" && user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If there's an error (e.g., missing env variables), allow the request through
    // and let the page handle the error
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};



