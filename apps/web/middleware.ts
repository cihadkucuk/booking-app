import { NextRequest, NextResponse } from "next/server";
import { extractStudioSlugFromHost } from "./lib/config";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const slug = extractStudioSlugFromHost(host);
  const headers = new Headers(request.headers);
  headers.set("x-studio-slug", slug);

  const response = NextResponse.next({
    request: {
      headers
    }
  });

  response.cookies.set("studio_slug", slug, {
    httpOnly: false,
    sameSite: "lax",
    path: "/"
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

