import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if the user is trying to access the game page
  if (request.nextUrl.pathname.startsWith("/game")) {
    // In a real implementation, we would verify the token payment here
    // For now, we'll redirect to a simple check on the client side

    // Get the auth cookie or token
    const hasAuth = request.cookies.has("privy-token")

    // If no auth, redirect to login
    if (!hasAuth) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/game/:path*"],
}
