"use client";

import RewardsPanel from "@/components/rewards-panel"
import Link from "next/link"

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4 md:mb-0 font-mono">S.S.I. REWARDS</h1>
          <div className="space-x-4">
            <Link
              href="/game"
              className="px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors font-mono"
            >
              PLAY GAME
            </Link>
            <Link
              href="/leaderboard"
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors font-mono"
            >
              LEADERBOARD
            </Link>
          </div>
        </header>

        <RewardsPanel />

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p className="font-mono">Compete for the highest score and earn BSI token rewards!</p>
        </div>
      </div>
    </div>
  )
}
