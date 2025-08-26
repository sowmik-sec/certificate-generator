import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle old editor routes or invalid routes
  if (pathname === "/editor" || pathname === "/design") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Ensure template IDs are lowercase
  const templateRouteMatch = pathname.match(/^\/design\/([^\/]+)\/edit$/);
  if (templateRouteMatch) {
    const templateId = templateRouteMatch[1];
    const lowercaseTemplateId = templateId.toLowerCase();

    if (templateId !== lowercaseTemplateId) {
      return NextResponse.redirect(
        new URL(`/design/${lowercaseTemplateId}/edit`, request.url)
      );
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
