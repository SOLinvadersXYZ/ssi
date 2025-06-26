import { type NextRequest, NextResponse } from "next/server"
import {
  saveRewardClaim,
  getUserRewardClaims,
  getRewardClaims,
  getLeaderboard,
  getPreviousPeriodDates,
} from "@/lib/database"
import { verifyPrivyToken } from "@/lib/privy"
import { TOKEN_CONFIG } from "@/config/token-config"

// GET endpoint to fetch reward claims
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await verifyPrivyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const isAdmin = searchParams.get("admin") === "true"
    const statusParam = searchParams.get("status")
    const status = statusParam ? statusParam.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" | "PAID" : undefined

    // Admin can see all claims, users can only see their own
    let claims
    if (isAdmin && user.id === TOKEN_CONFIG.adminUserId) {
      claims = await getRewardClaims(status)
    } else {
      claims = await getUserRewardClaims(user.id)
    }

    return NextResponse.json({ claims })
  } catch (error) {
    console.error("Error in rewards GET:", error)
    return NextResponse.json({ error: "Failed to fetch reward claims" }, { status: 500 })
  }
}

// POST endpoint to create a new reward claim
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await verifyPrivyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { period, username } = body

    if (!period || !username || !user.wallet?.address) {
      return NextResponse.json(
        {
          error: "Missing required fields or wallet address",
        },
        { status: 400 },
      )
    }

    // Check if period is valid
    if (period !== "weekly" && period !== "monthly") {
      return NextResponse.json({ error: "Invalid period" }, { status: 400 })
    }

    // Get previous period dates
    const { start, end } = getPreviousPeriodDates(period)
    const periodEnd = end

    // Get leaderboard for the previous period
    const leaderboard = await getLeaderboard(period === "weekly" ? "weekly" : "monthly", 100)

    // Find user's rank
    const userEntry = leaderboard.find((entry) => entry.userId === user.id)
    if (!userEntry) {
      return NextResponse.json(
        {
          error: "You did not participate in the previous period",
        },
        { status: 400 },
      )
    }

    const rank = leaderboard.findIndex((entry) => entry.userId === user.id) + 1

    // Check if user is in top 10
    if (rank > 10) {
      return NextResponse.json(
        {
          error: "Only top 10 players are eligible for rewards",
        },
        { status: 400 },
      )
    }

    // Calculate reward amount based on rank
    let amount = 0
    if (period === "weekly") {
      // Weekly rewards
      if (rank === 1) amount = 100
      else if (rank === 2) amount = 75
      else if (rank === 3) amount = 50
      else if (rank <= 5) amount = 25
      else if (rank <= 10) amount = 10
    } else {
      // Monthly rewards
      if (rank === 1) amount = 500
      else if (rank === 2) amount = 300
      else if (rank === 3) amount = 200
      else if (rank <= 5) amount = 100
      else if (rank <= 10) amount = 50
    }

    // Create reward claim
    const claim = {
      userId: user.id,
      username,
      amount,
      period,
      periodEnd,
      rank,
    }

    // Save to database
    const success = await saveRewardClaim(claim)

    if (success) {
      return NextResponse.json({ success: true, claim })
    } else {
      return NextResponse.json({ error: "Failed to save claim" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in rewards POST:", error)
    return NextResponse.json({ error: "Failed to create reward claim" }, { status: 500 })
  }
}
