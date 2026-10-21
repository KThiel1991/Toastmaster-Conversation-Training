import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, isAuthorized } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  if (await isAuthorized(request.cookies.get(AUTH_COOKIE)?.value)) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return Response.json(
      { error: "Nicht angemeldet. Bitte die Seite neu laden." },
      { status: 401 },
    );
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  // Alles schützen außer Anmeldung, Next-Dateien und App-Symbolen
  matcher: [
    "/((?!login|api/login|_next/static|_next/image|favicon.ico|icon|apple-icon|manifest.webmanifest).*)",
  ],
};
