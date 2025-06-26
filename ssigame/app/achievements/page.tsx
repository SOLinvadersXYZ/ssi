"use client"

import { useState, useEffect } from "react"
import { gameState } from "@/game-state"
import { AchievementShare } from "@/components/achievement-share"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Lock } from "lucide-react"
import { useSearchParams } from "next/navigation"
import type { Achievement } from "@/types"

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [highlightedAchievement, setHighlightedAchievement] = useState<string | null>(null)
  const searchParams = useSearchParams()
  
  // Initialize achievements after component mounts
  useEffect(() => {
    setAchievements(gameState.getAchievements())
  }, [])

  useEffect(() => {
    // Check if there's a highlighted achievement in the URL
    const highlight = searchParams.get("highlight")
    if (highlight) {
      setHighlightedAchievement(highlight)
    }

    // Update achievements when they change
    const handleAchievementUnlocked = () => {
      setAchievements(gameState.getAchievements())
    }

    gameState.on("achievementUnlocked", handleAchievementUnlocked)

    return () => {
      gameState.off("achievementUnlocked", handleAchievementUnlocked)
    }
  }, [searchParams])

  const unlockedAchievements = achievements.filter((a) => a.unlocked)
  const lockedAchievements = achievements.filter((a) => !a.unlocked)
  const secretAchievements = achievements.filter((a) => a.secret && !a.unlocked)

  const totalAchievements = achievements.length
  const completionPercentage = Math.round((unlockedAchievements.length / totalAchievements) * 100)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Achievements</h1>
      <p className="text-gray-400 mb-6">Track your progress and unlock special achievements</p>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Progress: {unlockedAchievements.length}/{totalAchievements}
          </span>
          <span className="text-sm font-bold">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>

      <Tabs defaultValue="unlocked">
        <TabsList className="mb-6">
          <TabsTrigger value="unlocked">Unlocked ({unlockedAchievements.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked ({lockedAchievements.length})</TabsTrigger>
          <TabsTrigger value="all">All ({totalAchievements})</TabsTrigger>
        </TabsList>

        <TabsContent value="unlocked">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`${
                  highlightedAchievement === achievement.name ? "border-yellow-500 shadow-lg shadow-yellow-500/20" : ""
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold">{achievement.name}</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Award className="h-4 w-4 text-black" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{achievement.description}</CardDescription>
                  <div className="mt-4 flex justify-end">
                    <AchievementShare achievement={achievement} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="locked">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => (
              <Card key={achievement.id} className="opacity-75">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold">{achievement.secret ? "???" : achievement.name}</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {achievement.secret ? "Secret achievement" : achievement.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`${
                  !achievement.unlocked
                    ? "opacity-75"
                    : highlightedAchievement === achievement.name
                      ? "border-yellow-500 shadow-lg shadow-yellow-500/20"
                      : ""
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold">
                    {achievement.secret && !achievement.unlocked ? "???" : achievement.name}
                  </CardTitle>
                  <div
                    className={`h-8 w-8 rounded-full ${achievement.unlocked ? "bg-yellow-500" : "bg-gray-700"} flex items-center justify-center`}
                  >
                    {achievement.unlocked ? (
                      <Award className="h-4 w-4 text-black" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {achievement.secret && !achievement.unlocked ? "Secret achievement" : achievement.description}
                  </CardDescription>
                  {achievement.unlocked && (
                    <div className="mt-4 flex justify-end">
                      <AchievementShare achievement={achievement} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
