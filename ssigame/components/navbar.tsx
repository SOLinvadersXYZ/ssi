"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"

// Create a named export for Navbar
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { authenticated, login, logout, user } = usePrivy()

  // Skip navbar on admin pages
  if (pathname.startsWith("/admin")) {
    return null
  }

  // Minimal navbar on game page
  if (pathname === "/game") {
    return (
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-12">
            <div className="flex items-center">
              <Link href="/" className="text-yellow-400 font-bold text-lg font-mono">
                S.S.I.
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 transition-colors font-mono text-sm"
              >
                🏠 HOME
              </Link>
              <Link
                href="/leaderboard"
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors font-mono text-sm"
              >
                🏆 SCORES
              </Link>
              {authenticated ? (
                <span className="text-gray-300 text-sm font-mono">
                  {user?.wallet?.address
                    ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
                    : user?.email?.address
                    ? user.email.address?.split("@")[0]
                    : "Player"}
                </span>
              ) : (
                <button
                  onClick={() => login()}
                  className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors font-mono text-sm"
                >
                  CONNECT
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-yellow-400 font-bold text-xl font-mono">
                S.S.I.
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono ${
                  isActive("/")
                    ? "border-yellow-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                HOME
              </Link>
              <Link
                href="/game"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono ${
                  isActive("/game")
                    ? "border-yellow-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                PLAY
              </Link>
              <Link
                href="/leaderboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono ${
                  isActive("/leaderboard")
                    ? "border-yellow-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                LEADERBOARD
              </Link>
              <Link
                href="/rewards"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono ${
                  isActive("/rewards")
                    ? "border-yellow-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                REWARDS
              </Link>
              <Link
                href="/friends"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono ${
                  isActive("/friends")
                    ? "border-yellow-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                FRIENDS
              </Link>
              <Link
                href="/challenges"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono ${
                  isActive("/challenges")
                    ? "border-yellow-400 text-white"
                    : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                }`}
              >
                CHALLENGES
              </Link>
              {authenticated && (
                <Link
                  href="/profile"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono ${
                    isActive("/profile")
                      ? "border-yellow-400 text-white"
                      : "border-transparent text-gray-300 hover:border-gray-300 hover:text-white"
                  }`}
                >
                  PROFILE
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {authenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm font-mono">
                  {user?.wallet?.address
                    ? `${user.wallet.address.slice(0, 4)}...${user.wallet.address.slice(-4)}`
                    : user?.email?.address
                    ? user.email.address?.split("@")[0]
                    : "Player"}
                </span>
                <button
                  onClick={() => logout()}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors font-mono text-sm"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors font-mono text-sm"
              >
                CONNECT
              </button>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M6 12h12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-mono ${
                isActive("/")
                  ? "bg-gray-800 border-yellow-400 text-white"
                  : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              HOME
            </Link>
            <Link
              href="/game"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-mono ${
                isActive("/game")
                  ? "bg-gray-800 border-yellow-400 text-white"
                  : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              PLAY
            </Link>
            <Link
              href="/leaderboard"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-mono ${
                isActive("/leaderboard")
                  ? "bg-gray-800 border-yellow-400 text-white"
                  : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              LEADERBOARD
            </Link>
            <Link
              href="/rewards"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-mono ${
                isActive("/rewards")
                  ? "bg-gray-800 border-yellow-400 text-white"
                  : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              REWARDS
            </Link>
            <Link
              href="/friends"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-mono ${
                isActive("/friends")
                  ? "bg-gray-800 border-yellow-400 text-white"
                  : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              FRIENDS
            </Link>
            <Link
              href="/challenges"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-mono ${
                isActive("/challenges")
                  ? "bg-gray-800 border-yellow-400 text-white"
                  : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              CHALLENGES
            </Link>
            {authenticated && (
              <Link
                href="/profile"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium font-mono ${
                  isActive("/profile")
                    ? "bg-gray-800 border-yellow-400 text-white"
                    : "border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-300 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                PROFILE
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {authenticated ? (
              <div className="flex items-center px-4 py-2">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                    {user?.email?.address?.charAt(0).toUpperCase() || "P"}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white font-mono">
                    {user?.email?.address?.split("@")[0] || "Player"}
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="mt-1 px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors font-mono text-sm"
                  >
                    LOGOUT
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2">
                <button
                  onClick={() => {
                    login()
                    setMobileMenuOpen(false)
                  }}
                  className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors font-mono text-sm"
                >
                  CONNECT
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

// Keep the default export for backward compatibility
export default Navbar
