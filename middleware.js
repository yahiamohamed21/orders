// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // السماح لهذه المسارات بدون لوجين
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  const user = req.cookies.get("user")?.value;
  const role = req.cookies.get("role")?.value;

  // لو مش عامل لوجين
  if (!user) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/admin") || pathname.startsWith("/user")) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // لو هو على /login وهو أصلا لوجين
  if (pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = role === "user" ? "/user" : "/admin";
    return NextResponse.redirect(url);
  }

  // حماية /admin: لازم admin أو superadmin
  if (pathname.startsWith("/admin")) {
    if (role !== "admin" && role !== "superadmin") {
      const url = req.nextUrl.clone();
      url.pathname = "/user";
      return NextResponse.redirect(url);
    }
  }

  // حماية /user: لازم user
  if (pathname.startsWith("/user")) {
    if (role !== "user") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
