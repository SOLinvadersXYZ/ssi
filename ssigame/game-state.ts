"use client"

import { EventEmitter, loadFromLocalStorage, saveToLocalStorage } from "./utils"
import type { GameSettings, HighScore, Achievement } from "./types"
import type { usePrivy } from "@privy-io/react-auth"
import {
  formatAchievementForSharing,
  formatHighScoreForSharing,
  formatLevelCompletionForSharing,
  formatBossDefeatForSharing,
  shareContent,
} from "@/lib/social-share"

// Default game settings
const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 0.7,
  musicVolume: 0.5,
  difficulty: "normal",
  vibrationEnabled: true,
  autoShareAchievements: false,
}

// Default achievements
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_kill",
    name: "First Contact",
    description: "Destroy your first enemy",
    unlocked: false,
    icon: "target",
  },
  {
    id: "score_1000",
    name: "Rookie Shooter",
    description: "Score 1,000 points",
    unlocked: false,
    icon: "trophy",
  },
  {
    id: "score_5000",
    name: "Space Ace",
    description: "Score 5,000 points",
    unlocked: false,
    icon: "medal",
  },
  {
    id: "complete_level",
    name: "Mission Success",
    description: "Complete your first level",
    unlocked: false,
    icon: "flag",
  },
  {
    id: "defeat_boss",
    name: "Boss Buster",
    description: "Defeat your first boss",
    unlocked: false,
    icon: "zap",
  },
  {
    id: "collect_all_weapons",
    name: "Arms Dealer",
    description: "Collect all weapon types",
    unlocked: false,
    icon: "crosshair",
  },
  {
    id: "no_damage",
    name: "Perfect Run",
    description: "Complete a level without taking damage",
    unlocked: false,
    icon: "shield",
  },
  {
    id: "secret_area",
    name: "Secret Agent",
    description: "Discover a secret area",
    unlocked: false,
    icon: "eye",
    secret: true,
  },
]

// Define GameStateType
type GameStateType = "title" | "playing" | "paused" | "gameOver" | "victory"

// Game state manager
class GameStateManager extends EventEmitter {
  private state: GameStateType = "title"
  private score = 0
  private level = 1
  private highScores: HighScore[] = []
  private settings: GameSettings
  private achievements: Achievement[]
  private weaponsCollected: Set<string> = new Set()
  private privy: ReturnType<typeof usePrivy> | null = null
  private gameStartTime = 0
  private gameEndTime = 0
  private gameInProgress = false
  private perfectLevelCompleted = false

  constructor() {
    super()
    this.settings = loadFromLocalStorage("bsiSettings", DEFAULT_SETTINGS)
    this.highScores = loadFromLocalStorage("bsiHighScores", [])
    this.achievements = loadFromLocalStorage("bsiAchievements", DEFAULT_ACHIEVEMENTS)
  }

  // Set Privy instance for authentication
  setPrivy(privyInstance: ReturnType<typeof usePrivy>) {
    this.privy = privyInstance
  }

  // State management
  getState(): GameStateType {
    return this.state
  }

  setState(newState: GameStateType): void {
    const oldState = this.state
    this.state = newState
    this.emit("stateChange", { oldState, newState })

    // Track game session
    if (newState === "playing" && oldState !== "paused") {
      this.startGameSession()
    } else if ((newState === "gameOver" || newState === "title") && oldState === "playing") {
      this.endGameSession()
    }
  }

  // Game session tracking
  private startGameSession() {
    this.gameStartTime = Date.now()
    this.gameInProgress = true
  }

  private endGameSession() {
    if (!this.gameInProgress) return

    this.gameEndTime = Date.now()
    this.gameInProgress = false

    // Calculate session duration in seconds
    const sessionDuration = Math.floor((this.gameEndTime - this.gameStartTime) / 1000)

    // Save progress to server if authenticated
    this.saveProgressToServer(sessionDuration)
  }

  // Score management
  getScore(): number {
    return this.score
  }

  addScore(points: number): void {
    this.score += points
    this.emit("scoreChange", this.score)

    // Check for score-based achievements
    if (this.score >= 1000) {
      this.unlockAchievement("score_1000")
    }
    if (this.score >= 5000) {
      this.unlockAchievement("score_5000")
    }
  }

  resetScore(): void {
    this.score = 0
    this.emit("scoreChange", this.score)
  }

  // Level management
  getLevel(): number {
    return this.level
  }

  nextLevel(): void {
    this.level++
    this.emit("levelChange", this.level)
    this.unlockAchievement("complete_level")

    // Share level completion if auto-share is enabled
    if (this.settings.autoShareAchievements && this.perfectLevelCompleted) {
      const shareContent = formatLevelCompletionForSharing(this.level - 1, this.score, true)
      this.shareIfEnabled(shareContent)
    }

    // Reset perfect level flag for next level
    this.perfectLevelCompleted = false
  }

  resetLevel(): void {
    this.level = 1
    this.emit("levelChange", this.level)
  }

  // High score management
  getHighScores(): HighScore[] {
    return [...this.highScores]
  }

  async addHighScore(name: string, walletAddress?: string): Promise<void> {
    const newScore: HighScore = {
      name,
      score: this.score,
      timestamp: Date.now(),
      ...(walletAddress && { walletAddress })
    }

    this.highScores.push(newScore)
    this.highScores.sort((a, b) => b.score - a.score)

    // Only keep top 10 scores locally
    if (this.highScores.length > 10) {
      this.highScores = this.highScores.slice(0, 10)
    }

    saveToLocalStorage("bsiHighScores", this.highScores)
    this.emit("highScoreChange", this.highScores)

    // Save to server if authenticated
    await this.saveHighScoreToServer(name)

    // Share high score if auto-share is enabled
    if (this.settings.autoShareAchievements) {
      const shareContent = formatHighScoreForSharing(this.score, this.level)
      this.shareIfEnabled(shareContent)
    }
  }

  isHighScore(): boolean {
    if (this.highScores.length < 10) return true
    return this.score > this.highScores[this.highScores.length - 1].score
  }

  // Settings management
  getSettings(): GameSettings {
    return { ...this.settings }
  }

  updateSettings(newSettings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    saveToLocalStorage("bsiSettings", this.settings)
    this.emit("settingsChange", this.settings)
  }

  // Achievement management
  getAchievements(): Achievement[] {
    return [...this.achievements]
  }

  unlockAchievement(id: string): void {
    const achievement = this.achievements.find((a) => a.id === id)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      saveToLocalStorage("bsiAchievements", this.achievements)
      this.emit("achievementUnlocked", achievement)

      // Share achievement if auto-share is enabled
      if (this.settings.autoShareAchievements) {
        const shareContent = formatAchievementForSharing(achievement.name, achievement.description)
        this.shareIfEnabled(shareContent)
      }
    }
  }

  // Weapon collection tracking
  collectWeapon(weaponType: string): void {
    this.weaponsCollected.add(weaponType)

    // Check if all weapons collected
    if (this.weaponsCollected.size === 5) {
      // Assuming 5 weapon types
      this.unlockAchievement("collect_all_weapons")
    }
  }

  // Boss defeat tracking
  defeatBoss(): void {
    this.unlockAchievement("defeat_boss")

    // Share boss defeat if auto-share is enabled
    if (this.settings.autoShareAchievements) {
      const shareContent = formatBossDefeatForSharing(this.level)
      this.shareIfEnabled(shareContent)
    }
  }

  // First kill tracking
  recordFirstKill(): void {
    this.unlockAchievement("first_kill")
  }

  // Record perfect level completion
  recordPerfectRun(): void {
    this.unlockAchievement("no_damage")
    this.perfectLevelCompleted = true
  }

  // Record secret area discovery
  discoverSecret(): void {
    this.unlockAchievement("secret_area")
  }

  // Reset game state for a new game
  resetGame(): void {
    this.resetScore()
    this.resetLevel()
    this.weaponsCollected.clear()
    this.setState("playing")
  }

  // Pause game
  pauseGame(): void {
    if (this.state === "playing") {
      this.setState("paused")
    }
  }

  // Share content if auto-share is enabled
  private shareIfEnabled(content: any): void {
    if (typeof window !== "undefined" && this.settings.autoShareAchievements) {
      // Use setTimeout to avoid blocking the main thread
      setTimeout(() => {
        shareContent(content).catch((err) => {
          console.error("Auto-share failed:", err)
        })
      }, 500)
    }
  }

  // Server integration for leaderboard and progress
  private async saveHighScoreToServer(username: string): Promise<void> {
    if (!this.privy?.authenticated || !this.privy.user) return

    try {
      const accessToken = await this.privy.getAccessToken()

      await fetch("/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          score: this.score,
          level: this.level,
          username,
        }),
      })
    } catch (error) {
      console.error("Failed to save high score to server:", error)
    }
  }

  private async saveProgressToServer(sessionDuration: number): Promise<void> {
    if (!this.privy?.authenticated || !this.privy.user) return

    try {
      const accessToken = await this.privy.getAccessToken()

      // Get unlocked achievement names
      const unlockedAchievements = this.achievements.filter((a) => a.unlocked).map((a) => a.name)

      await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          highestLevel: this.level,
          totalScore: this.score,
          achievements: unlockedAchievements,
          playCount: 1,
          sessionDuration,
        }),
      })
    } catch (error) {
      console.error("Failed to save progress to server:", error)
    }
  }

  // Initialize game with canvas and context
  init({
    canvas,
    ctx,
    onScoreUpdate,
    onLivesUpdate,
    onGameOver,
  }: {
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    onScoreUpdate: (newScore: number) => void
    onLivesUpdate: (newLives: number) => void
    onGameOver: () => void
  }) {
    this.gameInProgress = true
    this.gameStartTime = Date.now()
    // Initialize other game-related properties or listeners here
    console.log("Game initialized with canvas and context.")
  }
}

// Export singleton instance
export const gameState = new GameStateManager()
