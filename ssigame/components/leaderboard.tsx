"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import type { LeaderboardEntry, LeaderboardPeriod } from "@/lib/blob-storage"
import { formatPeriod } from "@/lib/blob-storage"

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<LeaderboardPeriod>("all-time")
  const [periodDisplay, setPeriodDisplay] = useState<string>("All Time")
  const { user, authenticated } = usePrivy()

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true)
        const response = await fetch(`/api/leaderboard?period=${period}`)

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard")
        }

        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
        setPeriodDisplay(formatPeriod(period))
      } catch (err) {
        console.error("Error fetching leaderboard:", err)
        setError("Failed to load leaderboard. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [period])

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Truncate wallet address for display
  const truncateAddress = (address?: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Highlight the current user's entries
  const isCurrentUser = (userId: string) => {
    return authenticated && user?.id === userId
  }

  // Handle period change
  const handlePeriodChange = (newPeriod: LeaderboardPeriod) => {
    setPeriod(newPeriod)
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 md:mb-0 font-mono">LEADERBOARD</h2>

        <div className="flex space-x-2">
          <button
            onClick={() => handlePeriodChange("all-time")}
            className={`px-3 py-1 rounded font-mono ${
              period === "all-time" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            ALL TIME
          </button>
          <button
            onClick={() => handlePeriodChange("weekly")}
            className={`px-3 py-1 rounded font-mono ${
              period === "weekly" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            WEEKLY
          </button>
          <button
            onClick={() => handlePeriodChange("monthly")}
            className={`px-3 py-1 rounded font-mono ${
              period === "monthly" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            MONTHLY
          </button>
        </div>
      </div>

      <div className="text-center mb-4">
        <h3 className="text-white font-mono">{periodDisplay}</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-gray-400 text-center py-8 font-mono">No scores recorded yet. Be the first!</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="px-4 py-2 text-yellow-400 font-mono">Rank</th>
                <th className="px-4 py-2 text-yellow-400 font-mono">Player</th>
                <th className="px-4 py-2 text-yellow-400 font-mono">Score</th>
                <th className="px-4 py-2 text-yellow-400 font-mono">Level</th>
                <th className="px-4 py-2 text-yellow-400 font-mono">Date</th>
                <th className="px-4 py-2 text-yellow-400 font-mono">Wallet</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr
                  key={`${entry.userId}_${entry.date}`}
                  className={`
                    border-b border-gray-700 
                    ${isCurrentUser(entry.userId) ? "bg-yellow-900 bg-opacity-30" : index % 2 === 0 ? "bg-gray-800" : ""}
                    hover:bg-gray-700 transition-colors
                  `}
                >
                  <td className="px-4 py-3 font-mono">
                    {index + 1 <= 3 ? (
                      <span
                        className={`
                        inline-block w-6 h-6 rounded-full text-center leading-6
                        ${
                          index === 0
                            ? "bg-yellow-400 text-black"
                            : index === 1
                              ? "bg-gray-300 text-black"
                              : "bg-yellow-800 text-white"
                        }
                      `}
                      >
                        {index + 1}
                      </span>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {isCurrentUser(entry.userId) ? (
                      <span className="text-yellow-400">{entry.username} (You)</span>
                    ) : (
                      entry.username
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono">{entry.score.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{entry.level}</td>
                  <td className="px-4 py-3 font-mono">{formatDate(entry.date)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{truncateAddress(entry.walletAddress)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {period !== "all-time" && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-yellow-400 font-mono mb-2">Rewards</h3>
          <p className="text-white font-mono text-sm mb-2">
            Top players for each {period} period are eligible for BSI token rewards:
          </p>
          <ul className="text-gray-300 font-mono text-sm space-y-1">
            {period === "weekly" ? (
              <>
                <li>1st place: 100 BSI</li>
                <li>2nd place: 75 BSI</li>
                <li>3rd place: 50 BSI</li>
                <li>4th-5th place: 25 BSI</li>
                <li>6th-10th place: 10 BSI</li>
              </>
            ) : (
              <>
                <li>1st place: 500 BSI</li>
                <li>2nd place: 300 BSI</li>
                <li>3rd place: 200 BSI</li>
                <li>4th-5th place: 100 BSI</li>
                <li>6th-10th place: 50 BSI</li>
              </>
            )}
          </ul>
          {authenticated ? (
            <div className="mt-4">
              <a
                href="/rewards"
                className="inline-block px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors font-mono"
              >
                CLAIM REWARDS
              </a>
            </div>
          ) : (
            <p className="mt-4 text-gray-400 font-mono text-sm">Connect your wallet to claim rewards.</p>
          )}
        </div>
      )}
    </div>
  )
}
