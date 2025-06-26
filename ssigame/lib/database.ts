import { PrismaClient } from '@prisma/client'

// Global Prisma client instance (singleton pattern for Next.js)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Types for our API
export interface LeaderboardEntry {
  id: string
  userId: string
  username: string
  score: number
  level: number
  date: Date
  verified?: boolean
  gameplayTime?: number
  deviceInfo?: string
}

export interface UserProgress {
  id: string
  userId: string
  highestLevel: number
  totalScore: number
  achievements: string[]
  lastPlayed: Date
  playCount: number
  totalPlayTime: number
}

export interface RewardClaim {
  id: string
  userId: string
  username: string
  amount: number
  period: string
  periodEnd: Date
  rank: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
  requestDate: Date
  reviewDate?: Date
  paymentDate?: Date
  paymentTxId?: string
  reviewNotes?: string
}

export interface Friend {
  id: string
  userId: string
  friendId: string
  username: string
  friendUsername: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  requestDate: Date
  responseDate?: Date
}

export interface Challenge {
  id: string
  challengerId: string
  challengerUsername: string
  challengeeId: string
  challengeeUsername: string
  score: number
  level: number
  expiryDate: Date
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'EXPIRED'
  createdAt: Date
  acceptedAt?: Date
  completedAt?: Date
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

// User operations
export async function createOrUpdateUser(privyId: string, username?: string, walletAddress?: string) {
  return await prisma.user.upsert({
    where: { privyId },
    update: { 
      username: username || undefined,
      walletAddress: walletAddress || undefined,
      updatedAt: new Date()
    },
    create: {
      privyId,
      username,
      walletAddress,
    },
  })
}

export async function getUser(privyId: string) {
  return await prisma.user.findUnique({
    where: { privyId },
  })
}

// Leaderboard operations
export async function saveLeaderboardEntry(entry: {
  userId: string
  username: string
  score: number
  level: number
  gameplayTime?: number
  deviceInfo?: string
}): Promise<boolean> {
  try {
    // Ensure user exists
    await createOrUpdateUser(entry.userId, entry.username)

    await prisma.leaderboardEntry.create({
      data: {
        userId: entry.userId,
        username: entry.username,
        score: entry.score,
        level: entry.level,
        gameplayTime: entry.gameplayTime,
        deviceInfo: entry.deviceInfo,
      },
    })

    return true
  } catch (error) {
    console.error("Error saving leaderboard entry:", error)
    return false
  }
}

export async function getLeaderboard(period: LeaderboardPeriod = "all-time", limit = 100): Promise<LeaderboardEntry[]> {
  try {
    const { start, end } = getPeriodDates(period)

    // Get all entries within the period, then group by user to get best scores
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: [
        { score: 'desc' },
        { date: 'asc' }
      ],
    })

    // Get highest score per user
    const userBestScores = new Map<string, LeaderboardEntry>()
    entries.forEach((entry) => {
      const existingEntry = userBestScores.get(entry.userId)
      if (!existingEntry || entry.score > existingEntry.score) {
        userBestScores.set(entry.userId, {
          id: entry.id,
          userId: entry.userId,
          username: entry.username,
          score: entry.score,
          level: entry.level,
          date: entry.date,
          verified: entry.verified,
          gameplayTime: entry.gameplayTime || undefined,
          deviceInfo: entry.deviceInfo || undefined,
        })
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
export async function saveUserProgress(progress: {
  userId: string
  highestLevel: number
  totalScore: number
  achievements: string[]
  playCount: number
  totalPlayTime: number
}): Promise<boolean> {
  try {
    // Ensure user exists
    await createOrUpdateUser(progress.userId)

    await prisma.userProgress.upsert({
      where: { userId: progress.userId },
      update: {
        highestLevel: Math.max(progress.highestLevel, 1),
        totalScore: Math.max(progress.totalScore, 0),
        achievements: progress.achievements,
        lastPlayed: new Date(),
        playCount: { increment: progress.playCount },
        totalPlayTime: { increment: progress.totalPlayTime },
        updatedAt: new Date(),
      },
      create: {
        userId: progress.userId,
        highestLevel: progress.highestLevel,
        totalScore: progress.totalScore,
        achievements: progress.achievements,
        playCount: progress.playCount,
        totalPlayTime: progress.totalPlayTime,
      },
    })

    return true
  } catch (error) {
    console.error("Error saving user progress:", error)
    return false
  }
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
    })

    if (!progress) return null

    return {
      id: progress.id,
      userId: progress.userId,
      highestLevel: progress.highestLevel,
      totalScore: progress.totalScore,
      achievements: progress.achievements,
      lastPlayed: progress.lastPlayed,
      playCount: progress.playCount,
      totalPlayTime: progress.totalPlayTime,
    }
  } catch (error) {
    console.error("Error fetching user progress:", error)
    return null
  }
}

// Reward claim operations
export async function saveRewardClaim(claim: {
  userId: string
  username: string
  amount: number
  period: string
  periodEnd: Date
  rank: number
}): Promise<boolean> {
  try {
    // Ensure user exists
    await createOrUpdateUser(claim.userId, claim.username)

    await prisma.rewardClaim.create({
      data: {
        userId: claim.userId,
        username: claim.username,
        amount: claim.amount,
        period: claim.period,
        periodEnd: claim.periodEnd,
        rank: claim.rank,
      },
    })

    return true
  } catch (error) {
    console.error("Error saving reward claim:", error)
    return false
  }
}

export async function getRewardClaims(status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'): Promise<RewardClaim[]> {
  try {
    const claims = await prisma.rewardClaim.findMany({
      where: status ? { status } : undefined,
      orderBy: { requestDate: 'desc' },
    })

    return claims.map(claim => ({
      id: claim.id,
      userId: claim.userId,
      username: claim.username,
      amount: claim.amount,
      period: claim.period,
      periodEnd: claim.periodEnd,
      rank: claim.rank,
      status: claim.status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID',
      requestDate: claim.requestDate,
      reviewDate: claim.reviewDate || undefined,
      paymentDate: claim.paymentDate || undefined,
      paymentTxId: claim.paymentTxId || undefined,
      reviewNotes: claim.reviewNotes || undefined,
    }))
  } catch (error) {
    console.error("Error fetching reward claims:", error)
    return []
  }
}

export async function getUserRewardClaims(userId: string): Promise<RewardClaim[]> {
  try {
    const claims = await prisma.rewardClaim.findMany({
      where: { userId },
      orderBy: { requestDate: 'desc' },
    })

    return claims.map(claim => ({
      id: claim.id,
      userId: claim.userId,
      username: claim.username,
      amount: claim.amount,
      period: claim.period,
      periodEnd: claim.periodEnd,
      rank: claim.rank,
      status: claim.status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID',
      requestDate: claim.requestDate,
      reviewDate: claim.reviewDate || undefined,
      paymentDate: claim.paymentDate || undefined,
      paymentTxId: claim.paymentTxId || undefined,
      reviewNotes: claim.reviewNotes || undefined,
    }))
  } catch (error) {
    console.error("Error fetching user reward claims:", error)
    return []
  }
}

// Friend operations
export async function saveFriendRequest(friend: {
  userId: string
  friendId: string
  username: string
  friendUsername: string
}): Promise<boolean> {
  try {
    // Ensure both users exist
    await createOrUpdateUser(friend.userId, friend.username)
    await createOrUpdateUser(friend.friendId, friend.friendUsername)

    await prisma.friend.create({
      data: {
        userId: friend.userId,
        friendId: friend.friendId,
        username: friend.username,
        friendUsername: friend.friendUsername,
      },
    })

    return true
  } catch (error) {
    console.error("Error saving friend request:", error)
    return false
  }
}

export async function getUserFriends(userId: string): Promise<Friend[]> {
  try {
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { userId },
          { friendId: userId },
        ],
      },
      orderBy: { requestDate: 'desc' },
    })

    return friends.map(friend => ({
      id: friend.id,
      userId: friend.userId,
      friendId: friend.friendId,
      username: friend.username,
      friendUsername: friend.friendUsername,
      status: friend.status as 'PENDING' | 'ACCEPTED' | 'REJECTED',
      requestDate: friend.requestDate,
      responseDate: friend.responseDate || undefined,
    }))
  } catch (error) {
    console.error("Error fetching user friends:", error)
    return []
  }
}

export async function updateFriendStatus(
  userId: string,
  friendId: string,
  status: 'ACCEPTED' | 'REJECTED'
): Promise<boolean> {
  try {
    await prisma.friend.updateMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
      data: {
        status,
        responseDate: new Date(),
        updatedAt: new Date(),
      },
    })

    return true
  } catch (error) {
    console.error("Error updating friend status:", error)
    return false
  }
}

// Challenge operations
export async function saveChallenge(challenge: {
  id: string
  challengerId: string
  challengerUsername: string
  challengeeId: string
  challengeeUsername: string
  score: number
  level: number
  expiryDate: Date
}): Promise<boolean> {
  try {
    // Ensure both users exist
    await createOrUpdateUser(challenge.challengerId, challenge.challengerUsername)
    await createOrUpdateUser(challenge.challengeeId, challenge.challengeeUsername)

    await prisma.challenge.create({
      data: {
        id: challenge.id,
        challengerId: challenge.challengerId,
        challengerUsername: challenge.challengerUsername,
        challengeeId: challenge.challengeeId,
        challengeeUsername: challenge.challengeeUsername,
        score: challenge.score,
        level: challenge.level,
        expiryDate: challenge.expiryDate,
      },
    })

    return true
  } catch (error) {
    console.error("Error saving challenge:", error)
    return false
  }
}

export async function getUserChallenges(userId: string): Promise<Challenge[]> {
  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        OR: [
          { challengerId: userId },
          { challengeeId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    return challenges.map(challenge => ({
      id: challenge.id,
      challengerId: challenge.challengerId,
      challengerUsername: challenge.challengerUsername,
      challengeeId: challenge.challengeeId,
      challengeeUsername: challenge.challengeeUsername,
      score: challenge.score,
      level: challenge.level,
      expiryDate: challenge.expiryDate,
      status: challenge.status as 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'EXPIRED',
      createdAt: challenge.createdAt,
      acceptedAt: challenge.acceptedAt || undefined,
      completedAt: challenge.completedAt || undefined,
      challengeeScore: challenge.challengeeScore || undefined,
      challengeeLevel: challenge.challengeeLevel || undefined,
      winnerId: challenge.winnerId || undefined,
    }))
  } catch (error) {
    console.error("Error fetching user challenges:", error)
    return []
  }
}

export async function getChallenge(challengeId: string): Promise<Challenge | null> {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    })

    if (!challenge) return null

    return {
      id: challenge.id,
      challengerId: challenge.challengerId,
      challengerUsername: challenge.challengerUsername,
      challengeeId: challenge.challengeeId,
      challengeeUsername: challenge.challengeeUsername,
      score: challenge.score,
      level: challenge.level,
      expiryDate: challenge.expiryDate,
      status: challenge.status as 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'EXPIRED',
      createdAt: challenge.createdAt,
      acceptedAt: challenge.acceptedAt || undefined,
      completedAt: challenge.completedAt || undefined,
      challengeeScore: challenge.challengeeScore || undefined,
      challengeeLevel: challenge.challengeeLevel || undefined,
      winnerId: challenge.winnerId || undefined,
    }
  } catch (error) {
    console.error("Error fetching challenge:", error)
    return null
  }
}

export async function updateChallengeStatus(
  challengeId: string,
  status: 'ACCEPTED' | 'COMPLETED' | 'EXPIRED',
  data?: {
    score?: number
    level?: number
    winnerId?: string
  }
): Promise<boolean> {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    if (status === 'ACCEPTED') {
      updateData.acceptedAt = new Date()
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
      if (data?.score) updateData.challengeeScore = data.score
      if (data?.level) updateData.challengeeLevel = data.level
      if (data?.winnerId) updateData.winnerId = data.winnerId
    }

    await prisma.challenge.update({
      where: { id: challengeId },
      data: updateData,
    })

    return true
  } catch (error) {
    console.error("Error updating challenge status:", error)
    return false
  }
}

// Admin operations
export async function updateRewardClaimStatus(
  claimId: string,
  status: 'APPROVED' | 'REJECTED' | 'PAID',
  notes?: string,
  paymentTxId?: string
): Promise<boolean> {
  try {
    const updateData: any = {
      status,
      reviewDate: new Date(),
      updatedAt: new Date(),
    }

    if (notes) updateData.reviewNotes = notes
    if (status === 'PAID' && paymentTxId) {
      updateData.paymentDate = new Date()
      updateData.paymentTxId = paymentTxId
    }

    await prisma.rewardClaim.update({
      where: { id: claimId },
      data: updateData,
    })

    return true
  } catch (error) {
    console.error("Error updating reward claim status:", error)
    return false
  }
}

// Delete operations (for admin use)
export async function deleteLeaderboardEntry(entryId: string): Promise<boolean> {
  try {
    await prisma.leaderboardEntry.delete({
      where: { id: entryId },
    })
    return true
  } catch (error) {
    console.error("Error deleting leaderboard entry:", error)
    return false
  }
} 