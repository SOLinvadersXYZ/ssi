"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useSearchParams } from "next/navigation"
import type { Challenge, Friend } from "@/lib/blob-storage"
import { Trophy, Clock, CheckCircle, Zap, Award } from "lucide-react"

export default function ChallengesPanel() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)
  const [selectedFriendName, setSelectedFriendName] = useState<string>("")
  const [score, setScore] = useState<number>(0)
  const [level, setLevel] = useState<number>(1)
  const [creatingChallenge, setCreatingChallenge] = useState(false)
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "completed" | "create">("incoming")
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const { user, authenticated, getAccessToken } = usePrivy()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if there's a friend parameter in the URL
    const friendParam = searchParams.get("friend")
    if (friendParam) {
      setSelectedFriend(friendParam)
      setActiveTab("create")
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchData() {
      if (!authenticated || !user) return

      try {
        setLoading(true)
        const accessToken = await getAccessToken()

        // Fetch challenges
        const challengesResponse = await fetch("/api/challenges", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!challengesResponse.ok) {
          throw new Error("Failed to fetch challenges")
        }

        const challengesData = await challengesResponse.json()
        setChallenges(challengesData.challenges || [])

        // Fetch friends
        const friendsResponse = await fetch("/api/friends", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!friendsResponse.ok) {
          throw new Error("Failed to fetch friends")
        }

        const friendsData = await friendsResponse.json()
        const acceptedFriends = (friendsData.friends || []).filter((friend: Friend) => friend.status === "accepted")
        setFriends(acceptedFriends)

        // If a friend is selected from URL param, set the friend name
        if (selectedFriend) {
          const friend = acceptedFriends.find(
            (f: Friend) =>
              (f.userId === user.id && f.friendId === selectedFriend) ||
              (f.userId === selectedFriend && f.friendId === user.id),
          )
          if (friend) {
            setSelectedFriendName(friend.userId === user.id ? friend.friendUsername : friend.username)
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load challenges. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [authenticated, user, getAccessToken, selectedFriend])

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authenticated || !user || !selectedFriend || !selectedFriendName || !score || !level) return

    try {
      setCreatingChallenge(true)
      const accessToken = await getAccessToken()

      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          friendId: selectedFriend,
          friendUsername: selectedFriendName,
          score,
          level,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create challenge")
      }

      const data = await response.json()
      setChallenges([data.challenge, ...challenges])
      setScore(0)
      setLevel(1)
      setActionSuccess("Challenge created successfully!")
      setTimeout(() => setActionSuccess(null), 3000)
      setActiveTab("outgoing")
    } catch (err: any) {
      console.error("Error creating challenge:", err)
      setError(err.message || "Failed to create challenge. Please try again later.")
      setTimeout(() => setError(null), 3000)
    } finally {
      setCreatingChallenge(false)
    }
  }

  const handleChallengeAction = async (challengeId: string, action: "accepted" | "completed") => {
    if (!authenticated || !user) return

    try {
      const accessToken = await getAccessToken()

      // For completed challenges, we need to provide a score
      const body: any = { challengeId, status: action }
      if (action === "completed") {
        // In a real implementation, this would be the actual score from the game
        // For now, we'll use a mock score that's higher than the challenge
        const challenge = challenges.find((c) => c.id === challengeId)
        if (challenge) {
          body.score = challenge.score + 100 // Mock score that beats the challenge
          body.level = challenge.level
        }
      }

      const response = await fetch("/api/challenges", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error("Failed to update challenge")
      }

      // Update local state
      setChallenges(
        challenges.map((challenge) => {
          if (challenge.id === challengeId) {
            if (action === "accepted") {
              return { ...challenge, status: action, acceptedAt: new Date().toISOString() }
            } else if (action === "completed") {
              return {
                ...challenge,
                status: action,
                completedAt: new Date().toISOString(),
                challengeeScore: body.score,
                challengeeLevel: body.level,
                winnerId: user.id, // Assuming the user won for this mock
              }
            }
          }
          return challenge
        }),
      )

      setActionSuccess(action === "accepted" ? "Challenge accepted!" : "Challenge completed!")
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (err) {
      console.error("Error updating challenge:", err)
      setError("Failed to update challenge. Please try again later.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Filter challenges based on active tab
  const filteredChallenges = challenges.filter((challenge) => {
    if (activeTab === "incoming") {
      return challenge.challengeeId === user?.id && challenge.status === "pending"
    } else if (activeTab === "outgoing") {
      return challenge.challengerId === user?.id && ["pending", "accepted"].includes(challenge.status)
    } else if (activeTab === "completed") {
      return challenge.status === "completed"
    }
    return false
  })

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Calculate time remaining for a challenge
  const getTimeRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    return `${days}d ${hours}h remaining`
  }

  if (!authenticated) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">CONNECT TO VIEW CHALLENGES</h2>
        <p className="text-gray-400 mb-6 font-mono">Connect your wallet to view and manage your challenges.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 font-mono">CHALLENGES</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <>
          {error && <div className="bg-red-500 text-white p-3 rounded mb-4 font-mono">{error}</div>}
          {actionSuccess && <div className="bg-green-500 text-white p-3 rounded mb-4 font-mono">{actionSuccess}</div>}

          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveTab("incoming")}
                className={`px-4 py-2 rounded font-mono flex items-center ${
                  activeTab === "incoming" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                INCOMING
              </button>
              <button
                onClick={() => setActiveTab("outgoing")}
                className={`px-4 py-2 rounded font-mono flex items-center ${
                  activeTab === "outgoing" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                <Zap className="w-4 h-4 mr-2" />
                OUTGOING
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded font-mono flex items-center ${
                  activeTab === "completed" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                <Award className="w-4 h-4 mr-2" />
                COMPLETED
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`px-4 py-2 rounded font-mono flex items-center ${
                  activeTab === "create" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                CREATE
              </button>
            </div>
          </div>

          {activeTab === "create" ? (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-yellow-400 font-mono mb-4">Create a Challenge</h3>

              {friends.length === 0 ? (
                <div className="text-gray-400 text-center py-4 font-mono">
                  You need to add friends before you can challenge them.{" "}
                  <a href="/friends" className="text-yellow-400 hover:underline">
                    Add friends
                  </a>
                </div>
              ) : (
                <form onSubmit={handleCreateChallenge} className="space-y-4">
                  <div>
                    <label className="block text-white font-mono mb-2">Select Friend</label>
                    <select
                      value={selectedFriend || ""}
                      onChange={(e) => {
                        setSelectedFriend(e.target.value)
                        const friend = friends.find(
                          (f) =>
                            (f.userId === user?.id && f.friendId === e.target.value) ||
                            (f.userId === e.target.value && f.friendId === user?.id),
                        )
                        if (friend) {
                          setSelectedFriendName(friend.userId === user?.id ? friend.friendUsername : friend.username)
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono focus:outline-none focus:border-yellow-500"
                      required
                    >
                      <option value="">Select a friend</option>
                      {friends.map((friend) => {
                        const friendId = friend.userId === user?.id ? friend.friendId : friend.userId
                        const friendName = friend.userId === user?.id ? friend.friendUsername : friend.username
                        return (
                          <option key={friendId} value={friendId}>
                            {friendName}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-mono mb-2">Your Score to Beat</label>
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      min="1"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono focus:outline-none focus:border-yellow-500"
                      placeholder="Enter your score"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white font-mono mb-2">Level Reached</label>
                    <input
                      type="number"
                      value={level}
                      onChange={(e) => setLevel(Number(e.target.value))}
                      min="1"
                      max="5"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono focus:outline-none focus:border-yellow-500"
                      placeholder="Enter level"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingChallenge || !selectedFriend || !score || !level}
                    className={`w-full px-4 py-2 font-bold rounded font-mono ${
                      creatingChallenge || !selectedFriend || !score || !level
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-yellow-500 text-black hover:bg-yellow-400"
                    }`}
                  >
                    {creatingChallenge ? "CREATING CHALLENGE..." : "SEND CHALLENGE"}
                  </button>
                </form>
              )}

              <p className="mt-4 text-gray-400 text-sm font-mono">
                Challenge your friends to beat your high score! They'll have 7 days to accept and complete the
                challenge.
              </p>
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-gray-400 text-center py-8 font-mono">
              {activeTab === "incoming"
                ? "No incoming challenges. Your friends haven't challenged you yet!"
                : activeTab === "outgoing"
                  ? "No outgoing challenges. Challenge your friends to beat your score!"
                  : "No completed challenges yet."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredChallenges.map((challenge) => {
                const isIncoming = challenge.challengeeId === user?.id
                const otherPlayerName = isIncoming ? challenge.challengerUsername : challenge.challengeeUsername
                const isCompleted = challenge.status === "completed"
                const userWon = isCompleted && challenge.winnerId === user?.id
                const otherPlayerWon = isCompleted && challenge.winnerId !== user?.id

                return (
                  <div
                    key={challenge.id}
                    className={`bg-gray-800 p-4 rounded-lg ${
                      isCompleted ? (userWon ? "border-l-4 border-green-500" : "border-l-4 border-red-500") : ""
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white mr-3">
                            {otherPlayerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-white font-mono">
                              {isIncoming ? "Challenge from" : "Challenge to"} {otherPlayerName}
                            </h3>
                            <p className="text-gray-400 text-xs font-mono">
                              Created: {formatDate(challenge.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-700 p-2 rounded mb-2">
                          <div className="flex justify-between">
                            <span className="text-gray-300 font-mono text-sm">Score to Beat:</span>
                            <span className="text-yellow-400 font-mono text-sm">{challenge.score}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300 font-mono text-sm">Level:</span>
                            <span className="text-yellow-400 font-mono text-sm">{challenge.level}</span>
                          </div>

                          {isCompleted && (
                            <>
                              <div className="border-t border-gray-600 my-2"></div>
                              <div className="flex justify-between">
                                <span className="text-gray-300 font-mono text-sm">Response Score:</span>
                                <span className="text-yellow-400 font-mono text-sm">{challenge.challengeeScore}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-300 font-mono text-sm">Response Level:</span>
                                <span className="text-yellow-400 font-mono text-sm">{challenge.challengeeLevel}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {isCompleted ? (
                          <div className={`text-sm font-mono ${userWon ? "text-green-400" : "text-red-400"}`}>
                            {userWon ? "You won this challenge!" : "You lost this challenge!"}
                          </div>
                        ) : (
                          <div className="flex items-center text-sm font-mono text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeRemaining(challenge.expiryDate)}
                          </div>
                        )}
                      </div>

                      {!isCompleted && isIncoming && challenge.status === "pending" && (
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                          <button
                            onClick={() => handleChallengeAction(challenge.id, "accepted")}
                            className="w-full md:w-auto px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 font-mono flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Accept
                          </button>
                          <a
                            href={`/game?challenge=${challenge.id}`}
                            className="w-full md:w-auto px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-mono text-center"
                          >
                            Play Now
                          </a>
                        </div>
                      )}

                      {!isCompleted && isIncoming && challenge.status === "accepted" && (
                        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                          <button
                            onClick={() => handleChallengeAction(challenge.id, "completed")}
                            className="w-full md:w-auto px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 font-mono flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Complete
                          </button>
                          <a
                            href={`/game?challenge=${challenge.id}`}
                            className="w-full md:w-auto px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-mono text-center"
                          >
                            Play Now
                          </a>
                        </div>
                      )}

                      {!isCompleted && !isIncoming && (
                        <div className="flex items-center">
                          {challenge.status === "pending" ? (
                            <span className="text-yellow-400 text-sm font-mono">Waiting for response</span>
                          ) : (
                            <span className="text-green-400 text-sm font-mono">Challenge accepted</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
