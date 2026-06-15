import { NextRequest, NextResponse } from "next/server"

const AUTH_ROUTES = ["/login", "/register"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get("SESSION-TOKEN")?.value

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  if (accessToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  if (!accessToken && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}