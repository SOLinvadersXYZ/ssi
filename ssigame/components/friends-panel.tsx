"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import type { Friend } from "@/lib/blob-storage"
import { UserPlus, UserCheck, UserX, Search, Users } from "lucide-react"

export default function FriendsPanel() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [friendUsername, setFriendUsername] = useState("")
  const [friendId, setFriendId] = useState("")
  const [addingFriend, setAddingFriend] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "add">("all")
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const { user, authenticated, getAccessToken } = usePrivy()

  useEffect(() => {
    async function fetchFriends() {
      if (!authenticated || !user) return

      try {
        setLoading(true)
        const accessToken = await getAccessToken()

        const response = await fetch("/api/friends", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch friends")
        }

        const data = await response.json()
        setFriends(data.friends || [])
      } catch (err) {
        console.error("Error fetching friends:", err)
        setError("Failed to load friends. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchFriends()
  }, [authenticated, user, getAccessToken])

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authenticated || !user || !friendUsername || !friendId) return

    try {
      setAddingFriend(true)
      const accessToken = await getAccessToken()

      const response = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          friendId,
          friendUsername,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to add friend")
      }

      const data = await response.json()
      setFriends([...friends, data.friendRequest])
      setFriendUsername("")
      setFriendId("")
      setActionSuccess("Friend request sent successfully!")
      setTimeout(() => setActionSuccess(null), 3000)
      setActiveTab("pending")
    } catch (err: any) {
      console.error("Error adding friend:", err)
      setError(err.message || "Failed to add friend. Please try again later.")
      setTimeout(() => setError(null), 3000)
    } finally {
      setAddingFriend(false)
    }
  }

  const handleFriendAction = async (friendId: string, action: "accepted" | "rejected") => {
    if (!authenticated || !user) return

    try {
      const accessToken = await getAccessToken()

      const response = await fetch("/api/friends", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          friendId,
          status: action,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update friend request")
      }

      // Update local state
      setFriends(
        friends.map((friend) => {
          if (
            (friend.userId === user.id && friend.friendId === friendId) ||
            (friend.userId === friendId && friend.friendId === user.id)
          ) {
            return { ...friend, status: action, responseDate: new Date().toISOString() }
          }
          return friend
        }),
      )

      setActionSuccess(action === "accepted" ? "Friend request accepted!" : "Friend request rejected.")
      setTimeout(() => setActionSuccess(null), 3000)
    } catch (err) {
      console.error("Error updating friend request:", err)
      setError("Failed to update friend request. Please try again later.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Filter friends based on active tab and search query
  const filteredFriends = friends.filter((friend) => {
    const matchesSearch =
      searchQuery === "" ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.friendUsername.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") {
      return matchesSearch && friend.status === "accepted"
    } else if (activeTab === "pending") {
      return matchesSearch && friend.status === "pending"
    }
    return matchesSearch
  })

  // Format date to be more readable
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (!authenticated) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 font-mono">CONNECT TO VIEW FRIENDS</h2>
        <p className="text-gray-400 mb-6 font-mono">Connect your wallet to view and manage your friends.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-yellow-400 mb-6 font-mono">FRIENDS</h2>

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
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded font-mono flex items-center ${
                  activeTab === "all" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                FRIENDS
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-4 py-2 rounded font-mono flex items-center ${
                  activeTab === "pending" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                REQUESTS
              </button>
              <button
                onClick={() => setActiveTab("add")}
                className={`px-4 py-2 rounded font-mono flex items-center ${
                  activeTab === "add" ? "bg-yellow-500 text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                ADD FRIEND
              </button>
            </div>

            {activeTab !== "add" && (
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded font-mono text-white focus:outline-none focus:border-yellow-500 pl-10"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>

          {activeTab === "add" ? (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-yellow-400 font-mono mb-4">Add a Friend</h3>
              <form onSubmit={handleAddFriend} className="space-y-4">
                <div>
                  <label className="block text-white font-mono mb-2">Friend's Username</label>
                  <input
                    type="text"
                    value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono focus:outline-none focus:border-yellow-500"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-mono mb-2">Friend's ID</label>
                  <input
                    type="text"
                    value={friendId}
                    onChange={(e) => setFriendId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono focus:outline-none focus:border-yellow-500"
                    placeholder="Enter friend's ID"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingFriend || !friendUsername || !friendId}
                  className={`w-full px-4 py-2 font-bold rounded font-mono ${
                    addingFriend || !friendUsername || !friendId
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-yellow-500 text-black hover:bg-yellow-400"
                  }`}
                >
                  {addingFriend ? "SENDING REQUEST..." : "SEND FRIEND REQUEST"}
                </button>
              </form>
              <p className="mt-4 text-gray-400 text-sm font-mono">
                Note: You can find a player's ID on their profile page.
              </p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-gray-400 text-center py-8 font-mono">
              {activeTab === "all"
                ? "You don't have any friends yet. Add some friends to challenge them!"
                : "No pending friend requests."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFriends.map((friend) => {
                const isIncoming = friend.friendId === user?.id
                const friendName = isIncoming ? friend.username : friend.friendUsername
                const friendUserId = isIncoming ? friend.userId : friend.friendId

                return (
                  <div
                    key={`${friend.userId}_${friend.friendId}`}
                    className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white mr-3">
                          {friendName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-mono">{friendName}</h3>
                          <p className="text-gray-400 text-xs font-mono">ID: {friendUserId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                      {friend.status === "pending" ? (
                        isIncoming ? (
                          <>
                            <button
                              onClick={() => handleFriendAction(friend.userId, "accepted")}
                              className="w-full md:w-auto px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 font-mono flex items-center justify-center"
                            >
                              <UserCheck className="w-4 h-4 mr-1" /> Accept
                            </button>
                            <button
                              onClick={() => handleFriendAction(friend.userId, "rejected")}
                              className="w-full md:w-auto px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 font-mono flex items-center justify-center"
                            >
                              <UserX className="w-4 h-4 mr-1" /> Reject
                            </button>
                            <span className="text-gray-400 text-xs font-mono">
                              Requested: {formatDate(friend.requestDate)}
                            </span>
                          </>
                        ) : (
                          <span className="text-yellow-400 text-sm font-mono">
                            Request sent: {formatDate(friend.requestDate)}
                          </span>
                        )
                      ) : friend.status === "accepted" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-400 text-sm font-mono">Friends</span>
                          <a
                            href={`/challenges?friend=${friendUserId}`}
                            className="px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-400 font-mono"
                          >
                            Challenge
                          </a>
                        </div>
                      ) : (
                        <span className="text-red-400 text-sm font-mono">Rejected</span>
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
