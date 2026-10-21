import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE, authToken, safeEqual } from "@/lib/auth";

export async function POST(request: Request) {
  const password = process.env.APP_PASSWORD;
  const form = await request.formData();
  const given = form.get("password");

  if (!password || (typeof given === "string" && safeEqual(given, password))) {
    const headers = new Headers({ Location: "/" });
    if (password) {
      headers.append(
        "Set-Cookie",
        `${AUTH_COOKIE}=${await authToken(password)}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
      );
    }
    return new Response(null, { status: 303, headers });
  }
  return new Response(null, { status: 303, headers: { Location: "/login?fehler=1" } });
}
