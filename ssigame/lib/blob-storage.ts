import { put, list, del } from "@vercel/blob"
import { BLOB_READ_WRITE_TOKEN } from "@/config/token-config"

// Define types for our leaderboard data
export interface LeaderboardEntry {
  userId: string
  username: string
  score: number
  level: number
  date: string
  walletAddress?: string
  verified?: boolean
  gameplayTime?: number // in seconds
  deviceInfo?: string
}

export interface UserProgress {
  userId: string
  highestLevel: number
  totalScore: number
  achievements: string[]
  lastPlayed: string
  playCount: number
  totalPlayTime: number // in seconds
  walletAddress?: string
}

export interface RewardClaim {
  userId: string
  username: string
  walletAddress: string
  amount: number
  period: string // 'weekly' or 'monthly'
  periodEnd: string
  rank: number
  status: "pending" | "approved" | "rejected" | "paid"
  requestDate: string
  reviewDate?: string
  paymentDate?: string
  paymentTxId?: string
  reviewNotes?: string
}

export interface Friend {
  userId: string
  friendId: string
  username: string
  friendUsername: string
  status: "pending" | "accepted" | "rejected"
  requestDate: string
  responseDate?: string
}

export interface Challenge {
  id: string
  challengerId: string
  challengerUsername: string
  challengeeId: string
  challengeeUsername: string
  score: number
  level: number
  expiryDate: string
  status: "pending" | "accepted" | "completed" | "expired"
  createdAt: string
  acceptedAt?: string
  completedAt?: string
  challengeeScore?: number
  challengeeLevel?: number
  winnerId?: string
}

export type LeaderboardPeriod = "all-time" | "weekly" | "monthly"

// Helper function to get period start and end dates
export function getPeriodDates(period: LeaderboardPeriod): { start: Date; end: Date } {
  const now = new Date()
  let start = new Date(now)
  let end = new Date(now)

  switch (period) {
    case "weekly":
      // Set start to beginning of current week (Monday)
      start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
      start.setHours(0, 0, 0, 0)
      // Set end to end of current week (Sunday)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    case "monthly":
      // Set start to beginning of current month
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      // Set end to end of current month
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      break
    case "all-time":
    default:
      // All time - start from a long time ago
      start = new Date(2020, 0, 1)
      break
  }

  return { start, end }
}

// Get previous period dates (for reward calculations)
export function getPreviousPeriodDates(period: "weekly" | "monthly"): { start: Date; end: Date } {
  const now = new Date()
  let start = new Date(now)
  let end = new Date(now)

  switch (period) {
    case "weekly":
      // Previous week
      end.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1) - 1)
      end.setHours(23, 59, 59, 999)
      start = new Date(end)
      start.setDate(end.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      break
    case "monthly":
      // Previous month
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0)
      break
  }

  return { start, end }
}

// Format period for display
export function formatPeriod(period: LeaderboardPeriod): string {
  const { start, end } = getPeriodDates(period)

  switch (period) {
    case "weekly":
      return `Week of ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
    case "monthly":
      return `${start.toLocaleString("default", { month: "long", year: "numeric" })}`
    case "all-time":
    default:
      return "All Time"
  }
}

// Leaderboard operations
export async function saveLeaderboardEntry(entry: LeaderboardEntry): Promise<boolean> {
  try {
    // Create a unique filename based on userId and timestamp
    const timestamp = new Date().toISOString()
    const filename = `leaderboard/${entry.userId}_${timestamp}.json`

    // Save to Blob storage
    await put(filename, JSON.stringify(entry), {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
    })

    return true
  } catch (error) {
    console.error("Error saving leaderboard entry:", error)
    return false
  }
}

export async function getLeaderboard(period: LeaderboardPeriod = "all-time", limit = 100): Promise<LeaderboardEntry[]> {
  try {
    // List all files in the leaderboard directory
    const { blobs } = await list({
      prefix: "leaderboard/",
      token: BLOB_READ_WRITE_TOKEN,
    })

    // Fetch and parse each file
    const entries: LeaderboardEntry[] = []
    const { start, end } = getPeriodDates(period)

    for (const blob of blobs) {
      const response = await fetch(blob.url)
      const entry = (await response.json()) as LeaderboardEntry

      // Filter by date for the specified period
      const entryDate = new Date(entry.date)
      if (entryDate >= start && entryDate <= end) {
        entries.push(entry)
      }
    }

    // Get highest score per user
    const userBestScores = new Map<string, LeaderboardEntry>()
    entries.forEach((entry) => {
      const existingEntry = userBestScores.get(entry.userId)
      if (!existingEntry || entry.score > existingEntry.score) {
        userBestScores.set(entry.userId, entry)
      }
    })

    // Sort by score (descending) and limit results
    return Array.from(userBestScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

// User progress operations
export async function saveUserProgress(progress: UserProgress): Promise<boolean> {
  try {
    // Use a fixed filename based on userId for easy updates
    const filename = `progress/${progress.userId}.json`

    // Save to Blob storage
    await put(filename, JSON.stringify(progress), {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
    })

    return true
  } catch (error) {
    console.error("Error saving user progress:", error)
    return false
  }
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    // List files with the specific userId
    const { blobs } = await list({
      prefix: `progress/${userId}`,
      token: BLOB_READ_WRITE_TOKEN,
    })

    if (blobs.length === 0) {
      return null
    }

    // Fetch and parse the file
    const response = await fetch(blobs[0].url)
    return (await response.json()) as UserProgress
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return null
  }
}

// Reward claim operations
export async function saveRewardClaim(claim: RewardClaim): Promise<boolean> {
  try {
    // Create a unique filename based on userId, period, and timestamp
    const filename = `rewards/${claim.userId}_${claim.period}_${claim.periodEnd}.json`

    // Save to Blob storage
    await put(filename, JSON.stringify(claim), {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
    })

    return true
  } catch (error) {
    console.error("Error saving reward claim:", error)
    return false
  }
}

export async function getRewardClaims(status?: "pending" | "approved" | "rejected" | "paid"): Promise<RewardClaim[]> {
  try {
    // List all files in the rewards directory
    const { blobs } = await list({
      prefix: "rewards/",
      token: BLOB_READ_WRITE_TOKEN,
    })

    // Fetch and parse each file
    const claims: RewardClaim[] = []

    for (const blob of blobs) {
      const response = await fetch(blob.url)
      const claim = (await response.json()) as RewardClaim

      // Filter by status if provided
      if (!status || claim.status === status) {
        claims.push(claim)
      }
    }

    // Sort by request date (newest first)
    return claims.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
  } catch (error) {
    console.error("Error fetching reward claims:", error)
    return []
  }
}

export async function getUserRewardClaims(userId: string): Promise<RewardClaim[]> {
  try {
    // List all files in the rewards directory for this user
    const { blobs } = await list({
      prefix: `rewards/${userId}`,
      token: BLOB_READ_WRITE_TOKEN,
    })

    // Fetch and parse each file
    const claims: RewardClaim[] = []

    for (const blob of blobs) {
      const response = await fetch(blob.url)
      const claim = (await response.json()) as RewardClaim
      claims.push(claim)
    }

    // Sort by request date (newest first)
    return claims.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
  } catch (error) {
    console.error("Error fetching user reward claims:", error)
    return []
  }
}

// Admin operations
export async function updateRewardClaimStatus(
  userId: string,
  period: string,
  periodEnd: string,
  status: "approved" | "rejected" | "paid",
  notes?: string,
  paymentTxId?: string,
): Promise<boolean> {
  try {
    // Find the specific claim
    const filename = `rewards/${userId}_${period}_${periodEnd}.json`

    // List to find the exact blob
    const { blobs } = await list({
      prefix: filename,
      token: BLOB_READ_WRITE_TOKEN,
    })

    if (blobs.length === 0) {
      return false
    }

    // Fetch the current claim
    const response = await fetch(blobs[0].url)
    const claim = (await response.json()) as RewardClaim

    // Update the claim
    const updatedClaim: RewardClaim = {
      ...claim,
      status,
      reviewDate: new Date().toISOString(),
      reviewNotes: notes || claim.reviewNotes,
    }

    // Add payment details if paid
    if (status === "paid" && paymentTxId) {
      updatedClaim.paymentDate = new Date().toISOString()
      updatedClaim.paymentTxId = paymentTxId
    }

    // Save the updated claim
    await put(filename, JSON.stringify(updatedClaim), {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
    })

    return true
  } catch (error) {
    console.error("Error updating reward claim status:", error)
    return false
  }
}

// Delete operations (for admin use)
export async function deleteLeaderboardEntry(userId: string, timestamp: string): Promise<boolean> {
  try {
    const filename = `leaderboard/${userId}_${timestamp}.json`
    await del(filename, { token: BLOB_READ_WRITE_TOKEN })
    return true
  } catch (error) {
    console.error("Error deleting leaderboard entry:", error)
    return false
  }
}

// Friend operations
export async function saveFriendRequest(friend: Friend): Promise<boolean> {
  try {
    // Create a unique filename
    const filename = `friends/${friend.userId}_${friend.friendId}.json`

    // Save to Blob storage
    await put(filename, JSON.stringify(friend), {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
    })

    return true
  } catch (error) {
    console.error("Error saving friend request:", error)
    return false
  }
}

export async function getUserFriends(userId: string): Promise<Friend[]> {
  try {
    // List all files in the friends directory that involve this user
    const { blobs } = await list({
      prefix: "friends/",
      token: BLOB_READ_WRITE_TOKEN,
    })

    // Filter for files that involve this user
    const userBlobs = blobs.filter(
      (blob) =>
        blob.url.includes(`friends/${userId}_`) || (blob.url.includes(`friends/`) && blob.url.includes(`_${userId}.`)),
    )

    // Fetch and parse each file
    const friends: Friend[] = []

    for (const blob of userBlobs) {
      const response = await fetch(blob.url)
      const friend = (await response.json()) as Friend
      friends.push(friend)
    }

    return friends
  } catch (error) {
    console.error("Error fetching user friends:", error)
    return []
  }
}

export async function updateFriendStatus(
  userId: string,
  friendId: string,
  status: "accepted" | "rejected",
): Promise<boolean> {
  try {
    // Try both possible filename combinations
    let filename = `friends/${userId}_${friendId}.json`
    let { blobs } = await list({
      prefix: filename,
      token: BLOB_READ_WRITE_TOKEN,
    })

    if (blobs.length === 0) {
      // Try the reverse order
      filename = `friends/${friendId}_${userId}.json`
      const result = await list({
        prefix: filename,
        token: BLOB_READ_WRITE_TOKEN,
      })
      blobs = result.blobs
    }

    if (blobs.length === 0) {
      return false
    }

    // Fetch the current friend request
    const response = await fetch(blobs[0].url)
    const friend = (await response.json()) as Friend

    // Update the status
    const updatedFriend: Friend = {
      ...friend,
      status,
      responseDate: new Date().toISOString(),
    }

    // Save the updated friend request
    await put(filename, JSON.stringify(updatedFriend), {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
    })

    return true
  } catch (error) {
    console.error("Error updating friend status:", error)
    return false
  }
}

// Challenge operations
export async function saveChallenge(challenge: Challenge): Promise<boolean> {
  try {
    // Create a unique filename
    const filename = `challenges/${challenge.id}.json`

    // Save to Blob storage
    await put(filename, JSON.stringify(challenge), {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
    })

    return true
  } catch (error) {
    console.error("Error saving challenge:", error)
    return false
  }
}

export async function getUserChallenges(userId: string): Promise<Challenge[]> {
  try {
    // List all files in the challenges directory
    const { blobs } = await list({
      prefix: "challenges/",
      token: BLOB_READ_WRITE_TOKEN,
    })

    // Fetch and parse each file
    const challenges: Challenge[] = []

    for (const blob of blobs) {
      const response = await fetch(blob.url)
      const challenge = (await response.json()) as Challenge

      // Filter for challenges that involve this user
      if (challenge.challengerId === userId || challenge.challengeeId === userId) {
        challenges.push(challenge)
      }
    }

    // Sort by creation date (newest first)
    return challenges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Error fetching user challenges:", error)
    return []
  }
}

export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  try {
    // List to find the exact blob
    const { blobs } = await list({
      prefix: `challenges/${challengeId}`,
      token: BLOB_READ_WRITE_TOKEN,
    })

    if (blobs.length === 0) {
      return null
    }

    // Fetch the challenge
    const response = await fetch(blobs[0].url)
    return (await response.json()) as Challenge
  } catch (error) {
    console.error("Error fetching challenge:", error)
    return null
  }
}

export async function updateChallengeStatus(
  challengeId: string,
  status: "accepted" | "completed" | "expired",
  data?: {
    score?: number
    level?: number
    winnerId?: string
  },
): Promise<boolean> {
  try {
    // Get the current challenge
    const challenge = await getChallenge(challengeId)
    if (!challenge) {
      return false
    }

    // Update the challenge
    const updatedChallenge: Challenge = {
      ...challenge,
      status,
    }

    // Add additional data based on status
    if (status === "accepted") {
      updatedChallenge.acceptedAt = new Date().toISOString()
    } else if (status === "completed" && data) {
      updatedChallenge.completedAt = new Date().toISOString()
      updatedChallenge.challengeeScore = data.score
      updatedChallenge.challengeeLevel = data.level
      updatedChallenge.winnerId = data.winnerId
    }

    // Save the updated challenge
    const filename = `challenges/${challengeId}.json`
    await put(filename, JSON.stringify(updatedChallenge), {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
    })

    return true
  } catch (error) {
    console.error("Error updating challenge status:", error)
    return false
  }
}
