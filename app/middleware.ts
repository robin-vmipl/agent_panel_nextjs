import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("nextjs_auth_token")?.value;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/ctc"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!token && isProtected) {
    return NextResponse.redirect(
      new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/ctc/:path*"],
};