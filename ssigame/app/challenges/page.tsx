"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChallengeShare } from "@/components/challenge-share"
import { Swords, CheckCircle, XCircle, Trophy, ArrowRight, Send, Inbox } from "lucide-react"
import Link from "next/link"

type Challenge = {
  id: string
  challengerId: string
  challengerUsername: string
  challengeeId: string
  challengeeUsername: string
  score: number
  level: number
  status: "pending" | "accepted" | "completed" | "expired"
  challengeeScore?: number
  challengeeLevel?: number
  createdAt: string
  expiresAt: string
}

export default function ChallengesPage() {
  const { authenticated, getAccessToken, user } = usePrivy()
  const [incomingChallenges, setIncomingChallenges] = useState<Challenge[]>([])
  const [outgoingChallenges, setOutgoingChallenges] = useState<Challenge[]>([])
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChallenges() {
      if (!authenticated || !user) return

      try {
        setLoading(true)
        const accessToken = await getAccessToken()

        const response = await fetch("/api/challenges", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()

          // Sort challenges into incoming, outgoing, and completed
          const incoming = data.challenges.filter(
            (c: Challenge) => c.challengeeId === user.id && c.status === "pending",
          )

          const outgoing = data.challenges.filter(
            (c: Challenge) => c.challengerId === user.id && ["pending", "accepted"].includes(c.status),
          )

          const completed = data.challenges.filter((c: Challenge) => c.status === "completed")

          setIncomingChallenges(incoming)
          setOutgoingChallenges(outgoing)
          setCompletedChallenges(completed)
        }
      } catch (error) {
        console.error("Error fetching challenges:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChallenges()
  }, [authenticated, user, getAccessToken])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()

    if (diffMs <= 0) return "Expired"

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`
    } else {
      return `${diffHours}h remaining`
    }
  }

  const handleAcceptChallenge = async (challengeId: string) => {
    if (!authenticated) return

    try {
      const accessToken = await getAccessToken()

      const response = await fetch("/api/challenges", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          challengeId,
          status: "accepted",
        }),
      })

      if (response.ok) {
        // Update the local state
        setIncomingChallenges((prev) => prev.map((c) => (c.id === challengeId ? { ...c, status: "accepted" } : c)))

        // Redirect to the game page with the challenge ID
        window.location.href = `/game?challenge=${challengeId}`
      }
    } catch (error) {
      console.error("Error accepting challenge:", error)
    }
  }

  const handleDeclineChallenge = async (challengeId: string) => {
    if (!authenticated) return

    try {
      const accessToken = await getAccessToken()

      const response = await fetch("/api/challenges", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          challengeId,
          status: "expired",
        }),
      })

      if (response.ok) {
        // Update the local state
        setIncomingChallenges((prev) => prev.filter((c) => c.id !== challengeId))
      }
    } catch (error) {
      console.error("Error declining challenge:", error)
    }
  }

  const handleCancelChallenge = async (challengeId: string) => {
    if (!authenticated) return

    try {
      const accessToken = await getAccessToken()

      const response = await fetch("/api/challenges", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        // Update the local state
        setOutgoingChallenges((prev) => prev.filter((c) => c.id !== challengeId))
      }
    } catch (error) {
      console.error("Error canceling challenge:", error)
    }
  }

  const renderIncomingChallenges = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      )
    }

    if (incomingChallenges.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">No incoming challenges</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {incomingChallenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center mr-3">
                  <Swords className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Challenge from {challenge.challengerUsername}</CardTitle>
                  <p className="text-xs text-gray-400">Score to beat: {challenge.score}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">{formatTimeRemaining(challenge.expiresAt)}</p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleDeclineChallenge(challenge.id)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleAcceptChallenge(challenge.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderOutgoingChallenges = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      )
    }

    if (outgoingChallenges.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">No outgoing challenges</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {outgoingChallenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                  <Send className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Challenge to {challenge.challengeeUsername}</CardTitle>
                  <p className="text-xs text-gray-400">Your score: {challenge.score}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  {challenge.status === "pending"
                    ? formatTimeRemaining(challenge.expiresAt)
                    : `Status: ${challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}`}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelChallenge(challenge.id)}
                  disabled={challenge.status !== "pending"}
                >
                  {challenge.status === "pending" ? "Cancel" : "Waiting..."}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderCompletedChallenges = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      )
    }

    if (completedChallenges.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">No completed challenges</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {completedChallenges.map((challenge) => {
          const isChallenger = user && challenge.challengerId === user.id
          const playerScore = isChallenger ? challenge.score : challenge.challengeeScore
          const opponentScore = isChallenger ? challenge.challengeeScore : challenge.score
          const playerWon = playerScore && opponentScore && playerScore > opponentScore
          const opponentName = isChallenger ? challenge.challengeeUsername : challenge.challengerUsername

          return (
            <Card key={challenge.id} className={playerWon ? "border-green-500" : "border-red-500"}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full ${playerWon ? "bg-green-500" : "bg-red-500"} flex items-center justify-center mr-3`}
                  >
                    {playerWon ? <Trophy className="h-5 w-5 text-white" /> : <XCircle className="h-5 w-5 text-white" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {isChallenger
                        ? `Challenge to ${challenge.challengeeUsername}`
                        : `Challenge from ${challenge.challengerUsername}`}
                    </CardTitle>
                    <div className="flex items-center text-sm">
                      <span className={playerWon ? "text-green-400" : "text-white"}>{playerScore || 0}</span>
                      <ArrowRight className="h-3 w-3 mx-2 text-gray-400" />
                      <span className={!playerWon ? "text-red-400" : "text-white"}>{opponentScore || 0}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">Completed on {formatDate(challenge.createdAt)}</p>
                  {playerWon && (
                    <ChallengeShare
                      opponentName={opponentName}
                      playerScore={playerScore || 0}
                      opponentScore={opponentScore || 0}
                      variant="inline"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Challenges</h1>
        <p className="text-gray-400 mb-4">You need to be logged in to view and create challenges.</p>
        <Link href="/">
          <Button>Log In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Challenges</h1>
      <p className="text-gray-400 mb-6">Challenge your friends to beat your high scores</p>

      <Tabs defaultValue="incoming">
        <TabsList className="mb-6">
          <TabsTrigger value="incoming" className="flex items-center">
            <Inbox className="h-4 w-4 mr-2" />
            Incoming ({incomingChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex items-center">
            <Send className="h-4 w-4 mr-2" />
            Outgoing ({outgoingChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed ({completedChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming">{renderIncomingChallenges()}</TabsContent>

        <TabsContent value="outgoing">{renderOutgoingChallenges()}</TabsContent>

        <TabsContent value="completed">{renderCompletedChallenges()}</TabsContent>
      </Tabs>

      <div className="mt-8">
        <Link href="/friends">
          <Button>
            <Swords className="h-4 w-4 mr-2" />
            Challenge a Friend
          </Button>
        </Link>
      </div>
    </div>
  )
}
