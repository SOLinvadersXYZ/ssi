"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import type { RewardClaim } from "@/lib/blob-storage"
import { TOKEN_CONFIG } from "@/config/token-config"

export default function AdminRewardsPanel() {
  const [claims, setClaims] = useState<RewardClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [processingClaim, setProcessingClaim] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState(false)
  const [actionMessage, setActionMessage] = useState<string>("")
  const [paymentTxId, setPaymentTxId] = useState<string>("")
  const [reviewNotes, setReviewNotes] = useState<string>("")
  const { user, authenticated, getAccessToken } = usePrivy()

  useEffect(() => {
    async function fetchRewardClaims() {
      if (!authenticated || !user) return

      try {
        setLoading(true)
        const accessToken = await getAccessToken()

        const response = await fetch(`/api/rewards?admin=true&status=${statusFilter}`, {
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
  }, [authenticated, user, getAccessToken, statusFilter, actionSuccess])

  const handleUpdateStatus = async (
    userId: string,
    period: string,
    periodEnd: string,
    status: "approved" | "rejected" | "paid",
  ) => {
    if (!authenticated || !user || user.id !== TOKEN_CONFIG.adminUserId) return

    try {
      const claimId = `${userId}_${period}_${periodEnd}`
      setProcessingClaim(claimId)

      const accessToken = await getAccessToken()

      const response = await fetch("/api/admin/rewards", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId,
          period,
          periodEnd,
          status,
          notes: reviewNotes,
          paymentTxId: status === "paid" ? paymentTxId : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update reward status")
      }

      setActionSuccess(true)
      setActionMessage(`Reward ${status} successfully!`)

      // Reset form fields
      setPaymentTxId("")
      setReviewNotes("")

      setTimeout(() => {
        setActionSuccess(false)
        setActionMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating reward status:", err)
      setError("Failed to update reward status. Please try again later.")
    } finally {
      setProcessingClaim(null)
    }
  }

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Check if user is admin
  const isAdmin = authenticated && user?.id === TOKEN_CONFIG.adminUserId

  if (!authenticated) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">ADMIN ACCESS REQUIRED</h2>
        <p className="text-gray-400 mb-6 font-mono">Please log in with an admin account to access this page.</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-red-500 mb-4 font-mono">UNAUTHORIZED</h2>
        <p className="text-gray-400 mb-6 font-mono">You do not have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full mx-auto">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 font-mono">REWARD CLAIMS MANAGEMENT</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4 mb-4">{error}</div>
      ) : (
        <>
          {actionSuccess && <div className="bg-green-500 text-white p-3 rounded mb-4 font-mono">{actionMessage}</div>}

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {["pending", "approved", "rejected", "paid"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded font-mono ${
                    statusFilter === status ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {status.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {claims.length === 0 ? (
            <div className="text-gray-400 text-center py-8 font-mono">No {statusFilter} reward claims found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-left">
                    <th className="px-4 py-2 text-yellow-400 font-mono">User</th>
                    <th className="px-4 py-2 text-yellow-400 font-mono">Period</th>
                    <th className="px-4 py-2 text-yellow-400 font-mono">Rank</th>
                    <th className="px-4 py-2 text-yellow-400 font-mono">Amount</th>
                    <th className="px-4 py-2 text-yellow-400 font-mono">Date</th>
                    <th className="px-4 py-2 text-yellow-400 font-mono">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim, index) => {
                    const claimId = `${claim.userId}_${claim.period}_${claim.periodEnd}`
                    const isProcessing = processingClaim === claimId

                    return (
                      <tr key={claimId} className={`border-b border-gray-700 ${index % 2 === 0 ? "bg-gray-800" : ""}`}>
                        <td className="px-4 py-3 font-mono">
                          <div>{claim.username}</div>
                          <div className="text-xs text-gray-400">{claim.walletAddress}</div>
                        </td>
                        <td className="px-4 py-3 font-mono capitalize">
                          {claim.period} ({formatDate(claim.periodEnd)})
                        </td>
                        <td className="px-4 py-3 font-mono">{claim.rank}</td>
                        <td className="px-4 py-3 font-mono">{claim.amount} BSI</td>
                        <td className="px-4 py-3 font-mono">{formatDate(claim.requestDate)}</td>
                        <td className="px-4 py-3 font-mono">
                          {statusFilter === "pending" && (
                            <div className="flex flex-col space-y-2">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(claim.userId, claim.period, claim.periodEnd, "approved")
                                  }
                                  disabled={isProcessing}
                                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                >
                                  {isProcessing ? "Processing..." : "Approve"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(claim.userId, claim.period, claim.periodEnd, "rejected")
                                  }
                                  disabled={isProcessing}
                                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                >
                                  {isProcessing ? "Processing..." : "Reject"}
                                </button>
                              </div>
                              <textarea
                                placeholder="Review notes"
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded"
                                rows={2}
                              />
                            </div>
                          )}

                          {statusFilter === "approved" && (
                            <div className="flex flex-col space-y-2">
                              <input
                                type="text"
                                placeholder="Payment Transaction ID"
                                value={paymentTxId}
                                onChange={(e) => setPaymentTxId(e.target.value)}
                                className="w-full px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded"
                              />
                              <button
                                onClick={() => handleUpdateStatus(claim.userId, claim.period, claim.periodEnd, "paid")}
                                disabled={isProcessing || !paymentTxId}
                                className={`px-2 py-1 text-white text-xs rounded ${
                                  isProcessing || !paymentTxId
                                    ? "bg-gray-500 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                                }`}
                              >
                                {isProcessing ? "Processing..." : "Mark as Paid"}
                              </button>
                            </div>
                          )}

                          {statusFilter === "rejected" && (
                            <div className="text-red-400 text-xs">{claim.reviewNotes || "No review notes"}</div>
                          )}

                          {statusFilter === "paid" && (
                            <div className="text-xs">
                              <div className="text-green-400">Paid on {formatDate(claim.paymentDate || "")}</div>
                              <div className="text-gray-400">TX: {claim.paymentTxId}</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 bg-gray-800 p-4 rounded-lg">
            <h3 className="text-yellow-400 font-mono mb-2">Reward Verification Guidelines</h3>
            <ol className="text-gray-300 font-mono text-sm space-y-2 list-decimal pl-5">
              <li>Verify the user's gameplay data to ensure they legitimately earned their rank.</li>
              <li>Check for suspicious patterns like sudden score jumps or unrealistic gameplay time.</li>
              <li>Ensure the user has a valid wallet address for payment.</li>
              <li>For payments, use the BSI token contract to send the appropriate amount.</li>
              <li>Always include the transaction ID when marking a reward as paid.</li>
            </ol>
            <p className="mt-4 text-yellow-400 font-mono text-sm">
              Note: This manual process will be automated in future updates according to the roadmap.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
