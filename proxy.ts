import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/src/lib/supabase/middleware";

const PROTECTED_PATHS = ["/host", "/player"];

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (!PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return response;
  }

  const user = response.headers.get("x-hawkshaw-user");

  if (user) {
    return response;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl, {
    headers: response.headers,
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

