import { type NextRequest, NextResponse } from "next/server"
import { getLeaderboard, saveLeaderboardEntry, type LeaderboardPeriod } from "@/lib/database"
import { verifyPrivyToken } from "@/lib/privy"

// GET endpoint to fetch leaderboard
export async function GET(request: NextRequest) {
  try {
    // Get query params - support both 'period' and 'timeframe' for backward compatibility
    const searchParams = request.nextUrl.searchParams
    let period = searchParams.get("period") || searchParams.get("timeframe") || "all-time"
    
    // Map frontend values to backend values
    if (period === "all") {
      period = "all-time"
    }
    
    const typedPeriod = period as LeaderboardPeriod
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    // Fetch leaderboard entries
    const leaderboard = await getLeaderboard(typedPeriod, limit)

    return NextResponse.json({ leaderboard, period: typedPeriod })
  } catch (error) {
    console.error("Error in leaderboard GET:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}

// POST endpoint to add a new leaderboard entry
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
    const { score, level, username, gameplayTime, deviceInfo } = body

    if (!score || !level || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create leaderboard entry
    const entry = {
      userId: user.id,
      username,
      score,
      level,
      gameplayTime,
      deviceInfo,
    }

    // Save to database
    const success = await saveLeaderboardEntry(entry)

    if (success) {
      return NextResponse.json({ success: true, entry })
    } else {
      return NextResponse.json({ error: "Failed to save entry" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in leaderboard POST:", error)
    return NextResponse.json({ error: "Failed to save leaderboard entry" }, { status: 500 })
  }
}
