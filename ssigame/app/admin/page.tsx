"use client";
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4 md:mb-0 font-mono">S.S.I. ADMIN PANEL</h1>
          <div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors font-mono"
            >
              MAIN SITE
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">REWARD MANAGEMENT</h2>
            <p className="text-gray-300 font-mono mb-4">
              Review and process player reward claims for weekly and monthly leaderboards.
            </p>
            <Link
              href="/admin/rewards"
              className="inline-block px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors font-mono"
            >
              MANAGE REWARDS
            </Link>
          </div>

          <div className="bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">LEADERBOARD MODERATION</h2>
            <p className="text-gray-300 font-mono mb-4">
              Review and moderate leaderboard entries for suspicious activity.
            </p>
            <Link
              href="/admin/leaderboard"
              className="inline-block px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors font-mono"
            >
              MODERATE LEADERBOARD
            </Link>
          </div>

          <div className="bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">USER MANAGEMENT</h2>
            <p className="text-gray-300 font-mono mb-4">Manage user accounts and review player statistics.</p>
            <Link
              href="/admin/users"
              className="inline-block px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors font-mono"
            >
              MANAGE USERS
            </Link>
          </div>

          <div className="bg-gray-900 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">GAME SETTINGS</h2>
            <p className="text-gray-300 font-mono mb-4">Configure game settings and reward parameters.</p>
            <Link
              href="/admin/settings"
              className="inline-block px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors font-mono"
            >
              GAME SETTINGS
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-yellow-400 font-mono mb-2">Roadmap</h3>
          <ul className="text-gray-300 font-mono text-sm space-y-2 list-disc pl-5">
            <li>Automated reward distribution system (Q3 2023)</li>
            <li>Enhanced anti-cheat detection (Q3 2023)</li>
            <li>Advanced player analytics dashboard (Q4 2023)</li>
            <li>Tournament system with special rewards (Q4 2023)</li>
            <li>Integration with Solana Program for on-chain leaderboards (Q1 2024)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
