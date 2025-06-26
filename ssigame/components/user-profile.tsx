"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import type { UserProgress, Friend, Challenge } from "@/lib/blob-storage"
import { Trophy, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function UserProfile() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, authenticated, getAccessToken } = usePrivy()

  useEffect(() => {
    async function fetchUserData() {
      if (!authenticated || !user) return

      try {
        setLoading(true)

        // Get access token for authentication
        const accessToken = await getAccessToken()

        // Fetch user progress
        const progressResponse = await fetch("/api/progress", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!progressResponse.ok) {
          throw new Error("Failed to fetch user progress")
        }

        const progressData = await progressResponse.json()
        setProgress(progressData.progress || null)

        // Fetch friends
        const friendsResponse = await fetch("/api/friends", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json()
          setFriends(friendsData.friends || [])
        }

        // Fetch challenges
        const challengesResponse = await fetch("/api/challenges", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (challengesResponse.ok) {
          const challengesData = await challengesResponse.json()
          setChallenges(challengesData.challenges || [])
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load your profile data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [authenticated, user, getAccessToken])

  if (!authenticated) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto text-center">
        <p className="text-gray-400 font-mono">Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center font-mono">YOUR PROFILE</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : !progress ? (
        <div className="text-gray-400 text-center py-8 font-mono">No progress data available.</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-mono">Game Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm font-mono">Highest Level</p>
                <p className="text-white text-xl font-mono">{progress.highestLevel}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-mono">Total Score</p>
                <p className="text-white text-xl font-mono">{progress.totalScore.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-mono">Games Played</p>
                <p className="text-white text-xl font-mono">{progress.playCount}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-mono">Last Played</p>
                <p className="text-white text-sm font-mono">{new Date(progress.lastPlayed).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-mono">Social</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Users className="text-yellow-400 mr-2 h-5 w-5" />
                  <span className="text-white font-mono">Friends</span>
                </div>
                <div className="flex items-center">
                  <span className="text-white font-mono mr-2">
                    {friends.filter((f) => f.status === "accepted").length}
                  </span>
                  <Link
                    href="/friends"
                    className="text-xs bg-gray-700 px-2 py-1 rounded text-white hover:bg-gray-600 font-mono"
                  >
                    View
                  </Link>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Trophy className="text-yellow-400 mr-2 h-5 w-5" />
                  <span className="text-white font-mono">Challenges</span>
                </div>
                <div className="flex items-center">
                  <span className="text-white font-mono mr-2">{challenges.length}</span>
                  <Link
                    href="/challenges"
                    className="text-xs bg-gray-700 px-2 py-1 rounded text-white hover:bg-gray-600 font-mono"
                  >
                    View
                  </Link>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Zap className="text-yellow-400 mr-2 h-5 w-5" />
                  <span className="text-white font-mono">Wins</span>
                </div>
                <span className="text-white font-mono">
                  {challenges.filter((c) => c.status === "completed" && c.winnerId === user?.id).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-mono">Achievements</h3>
            {progress.achievements.length === 0 ? (
              <p className="text-gray-400 text-center py-2 font-mono">No achievements unlocked yet.</p>
            ) : (
              <ul className="space-y-2">
                {progress.achievements.map((achievement) => (
                  <li key={achievement} className="flex items-center">
                    <span className="text-yellow-400 mr-2">★</span>
                    <span className="text-white font-mono">{achievement}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2 font-mono">Account</h3>
            <div className="space-y-2">
              <div>
                <p className="text-gray-400 text-sm font-mono">Username</p>
                <p className="text-white font-mono">{user?.email?.address?.split("@")[0] || "Anonymous"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-mono">User ID</p>
                <p className="text-white text-xs font-mono break-all">{user?.id}</p>
                <p className="text-gray-500 text-xs font-mono mt-1">Share this ID with friends to connect</p>
              </div>
              {user?.wallet?.address && (
                <div>
                  <p className="text-gray-400 text-sm font-mono">Wallet</p>
                  <p className="text-white text-xs font-mono break-all">{user.wallet.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
