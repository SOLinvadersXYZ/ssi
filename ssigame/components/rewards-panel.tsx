"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import type { RewardClaim } from "@/lib/blob-storage"

export default function RewardsPanel() {
  const [claims, setClaims] = useState<RewardClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimingPeriod, setClaimingPeriod] = useState<"weekly" | "monthly" | null>(null)
  const [claimSuccess, setClaimSuccess] = useState(false)
  const { user, authenticated, getAccessToken, login } = usePrivy()

  useEffect(() => {
    async function fetchRewardClaims() {
      if (!authenticated || !user) return

      try {
        setLoading(true)
        const accessToken = await getAccessToken()

        const response = await fetch("/api/rewards", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch reward claims")
        }

        const data = await response.json()
        setClaims(data.claims || [])
      } catch (err) {
        console.error("Error fetching reward claims:", err)
        setError("Failed to load reward claims. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRewardClaims()
  }, [authenticated, user, getAccessToken, claimSuccess])

  const handleClaimReward = async (period: "weekly" | "monthly") => {
    if (!authenticated || !user) return

    try {
      setClaimingPeriod(period)
      const accessToken = await getAccessToken()

      const response = await fetch("/api/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          period,
          username: user.email?.address?.split("@")[0] || "Anonymous",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to claim reward")
      }

      setClaimSuccess(true)
      setTimeout(() => setClaimSuccess(false), 3000)
    } catch (err: any) {
      console.error("Error claiming reward:", err)
      setError(err.message || "Failed to claim reward. Please try again later.")
    } finally {
      setClaimingPeriod(null)
    }
  }

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "paid":
        return "bg-blue-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!authenticated) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">CONNECT TO CLAIM REWARDS</h2>
        <p className="text-gray-400 mb-6 font-mono">Connect your wallet to view and claim your BSI token rewards.</p>
        <button
          onClick={() => login()}
          className="px-6 py-3 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors font-mono"
        >
          CONNECT WALLET
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 font-mono">YOUR REWARDS</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4 mb-4">{error}</div>
      ) : (
        <>
          {claimSuccess && (
            <div className="bg-green-500 text-white p-3 rounded mb-4 font-mono">
              Reward claim submitted successfully! It will be reviewed by the game admin.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-yellow-400 font-mono mb-4">Weekly Rewards</h3>
              <p className="text-white font-mono text-sm mb-4">
                Top 10 players on the weekly leaderboard are eligible for BSI token rewards.
              </p>
              <button
                onClick={() => handleClaimReward("weekly")}
                disabled={claimingPeriod !== null}
                className={`w-full px-4 py-2 font-bold rounded font-mono ${
                  claimingPeriod !== null
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
              >
                {claimingPeriod === "weekly" ? "CLAIMING..." : "CLAIM WEEKLY REWARD"}
              </button>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-yellow-400 font-mono mb-4">Monthly Rewards</h3>
              <p className="text-white font-mono text-sm mb-4">
                Top 10 players on the monthly leaderboard are eligible for BSI token rewards.
              </p>
              <button
                onClick={() => handleClaimReward("monthly")}
                disabled={claimingPeriod !== null}
                className={`w-full px-4 py-2 font-bold rounded font-mono ${
                  claimingPeriod !== null
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
              >
                {claimingPeriod === "monthly" ? "CLAIMING..." : "CLAIM MONTHLY REWARD"}
              </button>
            </div>
          </div>

          <h3 className="text-xl font-bold text-yellow-400 mb-4 font-mono">YOUR CLAIM HISTORY</h3>

          {claims.length === 0 ? (
            <div className="text-gray-400 text-center py-8 font-mono">
              No reward claims yet. Reach the top 10 on weekly or monthly leaderboards to earn rewards!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="px-4 py-2 text-yellow-400 font-mono">Period</th>
                    <th className="px-4 py-2 text-yellow-400 font-mono">Rank</th>
                    <th className="px-4 py-2 text-yellow-400 font-mono">Amount</th>
                    <th className="px-4 py-2 text-yellow-400 font-mono">Status</th>
                    <th className="px-4 py-2 text-yellow-400 font-mono">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim, index) => (
                    <tr
                      key={`${claim.userId}_${claim.period}_${claim.periodEnd}`}
                      className={`border-b border-gray-700 ${index % 2 === 0 ? "bg-gray-800" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono capitalize">
                        {claim.period} ({formatDate(claim.periodEnd)})
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {claim.rank <= 3 ? (
                          <span
                            className={`
                              inline-block w-6 h-6 rounded-full text-center leading-6
                              ${
                                claim.rank === 1
                                  ? "bg-yellow-400 text-black"
                                  : claim.rank === 2
                                    ? "bg-gray-300 text-black"
                                    : "bg-yellow-800 text-white"
                              }
                            `}
                          >
                            {claim.rank}
                          </span>
                        ) : (
                          claim.rank
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">{claim.amount} BSI</td>
                      <td className="px-4 py-3 font-mono">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(claim.status)} text-white uppercase`}
                        >
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">{formatDate(claim.requestDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 bg-gray-800 p-4 rounded-lg">
            <h3 className="text-yellow-400 font-mono mb-2">Reward Process</h3>
            <ol className="text-gray-300 font-mono text-sm space-y-2 list-decimal pl-5">
              <li>Claim your reward after the weekly or monthly period ends.</li>
              <li>Game admins will verify your gameplay to ensure fair play.</li>
              <li>Approved rewards will be sent to your connected wallet.</li>
              <li>Payment typically takes 1-3 days after approval.</li>
            </ol>
            <p className="mt-4 text-yellow-400 font-mono text-sm">
              Note: Rewards are currently distributed manually. Automated distribution is coming soon!
            </p>
          </div>
        </>
      )}
    </div>
  )
}
