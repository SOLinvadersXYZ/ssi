"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreShare } from "@/components/score-share"
import { Trophy, Calendar, Clock } from "lucide-react"
import { useAppLoading } from "@/hooks/use-app-loading"
import { LeaderboardSkeleton } from "@/components/ui/app-skeleton"

type LeaderboardEntry = {
  id: string
  userId: string
  username: string
  score: number
  level: number
  date: string
}

export default function LeaderboardPage() {
  const { authenticated, getAccessToken, user } = usePrivy()
  const { isDataPreloaded, getCachedData } = useAppLoading()
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([])
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([])
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<{ all: number; weekly: number; monthly: number }>({
    all: -1,
    weekly: -1,
    monthly: -1,
  })

  useEffect(() => {
    async function fetchLeaderboards() {
      try {
        setLoading(true)

        // Try to get cached data first
        const cachedLeaderboard = getCachedData<{all: LeaderboardEntry[], weekly: LeaderboardEntry[], monthly: LeaderboardEntry[]}>('leaderboard')
        
        if (cachedLeaderboard) {
          // Use cached data immediately
          setAllTimeLeaderboard(cachedLeaderboard.all || [])
          setWeeklyLeaderboard(cachedLeaderboard.weekly || [])
          setMonthlyLeaderboard(cachedLeaderboard.monthly || [])
          
          // Calculate user rank from cached data
          if (authenticated && user) {
            const userId = user.id
            const allTimeRank = cachedLeaderboard.all.findIndex(entry => entry.userId === userId) + 1
            const weeklyRank = cachedLeaderboard.weekly.findIndex(entry => entry.userId === userId) + 1
            const monthlyRank = cachedLeaderboard.monthly.findIndex(entry => entry.userId === userId) + 1

            setUserRank({
              all: allTimeRank > 0 ? allTimeRank : -1,
              weekly: weeklyRank > 0 ? weeklyRank : -1,
              monthly: monthlyRank > 0 ? monthlyRank : -1,
            })
          }
          
          setLoading(false)
          return
        }

        // Fallback to API if no cached data
        const [allTimeResponse, weeklyResponse, monthlyResponse] = await Promise.all([
          fetch("/api/leaderboard?timeframe=all"),
          fetch("/api/leaderboard?timeframe=weekly"),
          fetch("/api/leaderboard?timeframe=monthly")
        ])

        const [allTimeData, weeklyData, monthlyData] = await Promise.all([
          allTimeResponse.json(),
          weeklyResponse.json(),
          monthlyResponse.json()
        ])

        setAllTimeLeaderboard(allTimeData.leaderboard || [])
        setWeeklyLeaderboard(weeklyData.leaderboard || [])
        setMonthlyLeaderboard(monthlyData.leaderboard || [])

        // Find user's rank if authenticated
        if (authenticated && user) {
          const userId = user.id
          const allTimeRank = (allTimeData.leaderboard || []).findIndex((entry: LeaderboardEntry) => entry.userId === userId) + 1
          const weeklyRank = (weeklyData.leaderboard || []).findIndex((entry: LeaderboardEntry) => entry.userId === userId) + 1
          const monthlyRank = (monthlyData.leaderboard || []).findIndex((entry: LeaderboardEntry) => entry.userId === userId) + 1

          setUserRank({
            all: allTimeRank > 0 ? allTimeRank : -1,
            weekly: weeklyRank > 0 ? weeklyRank : -1,
            monthly: monthlyRank > 0 ? monthlyRank : -1,
          })
        }
      } catch (error) {
        console.error("Error fetching leaderboards:", error)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if data is preloaded (app is ready)
    if (isDataPreloaded) {
      fetchLeaderboards()
    }
  }, [authenticated, user, isDataPreloaded, getCachedData])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Show skeleton while app is initializing
  if (!isDataPreloaded) {
    return <LeaderboardSkeleton />
  }

  const renderLeaderboard = (leaderboard: LeaderboardEntry[], timeframe: "all" | "weekly" | "monthly") => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      )
    }

    if (leaderboard.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">No scores recorded yet</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {authenticated && userRank[timeframe] > 0 && (
          <div className="bg-yellow-500 bg-opacity-20 p-4 rounded-lg mb-4">
            <p className="text-yellow-400 font-bold">
              Your Rank: #{userRank[timeframe]}
              {userRank[timeframe] <= 3 && " 🏆"}
            </p>
          </div>
        )}

        {leaderboard.map((entry, index) => (
          <Card key={entry.id} className={index < 3 ? "border-yellow-500" : ""}>
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    index === 0
                      ? "bg-yellow-500"
                      : index === 1
                        ? "bg-gray-300"
                        : index === 2
                          ? "bg-amber-700"
                          : "bg-gray-700"
                  }`}
                >
                  <span className={`font-bold ${index < 3 ? "text-black" : "text-white"}`}>{index + 1}</span>
                </div>
                <CardTitle className="text-lg">{entry.username}</CardTitle>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-4">
                  <p className="text-xl font-bold">{entry.score}</p>
                  <p className="text-xs text-gray-400">Level {entry.level}</p>
                </div>
                {authenticated && user && entry.userId === user.id && (
                  <ScoreShare score={entry.score} level={entry.level} variant="minimal" />
                )}
              </div>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-xs text-gray-400">{formatDate(entry.date)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
      <p className="text-gray-400 mb-6">See who's topping the charts in S.S.I.</p>

      <Tabs defaultValue="all-time">
        <TabsList className="mb-6">
          <TabsTrigger value="all-time" className="flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            All-Time
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Monthly
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Weekly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-time">{renderLeaderboard(allTimeLeaderboard, "all")}</TabsContent>

        <TabsContent value="monthly">{renderLeaderboard(monthlyLeaderboard, "monthly")}</TabsContent>

        <TabsContent value="weekly">{renderLeaderboard(weeklyLeaderboard, "weekly")}</TabsContent>
      </Tabs>
    </div>
  )
}
