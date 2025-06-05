// middleware.ts (root hoặc src)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedGroupPrefix = "/(private)";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(protectedGroupPrefix)) {
    if (!token) {
      const loginUrl = new URL("/(public)/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(private)/:path*"],
};
