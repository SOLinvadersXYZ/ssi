import { type NextRequest, NextResponse } from "next/server"
import { getUserProgress, saveUserProgress } from "@/lib/database"
import { verifyPrivyToken } from "@/lib/privy"

// GET endpoint to fetch user progress
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

    // Fetch user progress
    const progress = await getUserProgress(user.id)

    if (progress) {
      return NextResponse.json({ progress })
    } else {
      // Return empty progress if not found
      return NextResponse.json({
        progress: {
          userId: user.id,
          highestLevel: 1,
          totalScore: 0,
          achievements: [],
          lastPlayed: new Date().toISOString(),
          playCount: 0,
        },
      })
    }
  } catch (error) {
    console.error("Error in progress GET:", error)
    return NextResponse.json({ error: "Failed to fetch user progress" }, { status: 500 })
  }
}

// POST endpoint to update user progress
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
    const { highestLevel, totalScore, achievements, playCount } = body

    // Get existing progress
    const existingProgress = await getUserProgress(user.id)

    // Create or update progress
    const progress = {
      userId: user.id,
      highestLevel: Math.max(existingProgress?.highestLevel || 0, highestLevel || 0),
      totalScore: Math.max(existingProgress?.totalScore || 0, totalScore || 0),
      achievements: [...new Set([...(existingProgress?.achievements || []), ...(achievements || [])])],
      lastPlayed: new Date().toISOString(),
      playCount: (existingProgress?.playCount || 0) + (playCount ? 1 : 0),
      totalPlayTime: existingProgress?.totalPlayTime || 0,
    }

    // Save to Blob storage
    const success = await saveUserProgress(progress)

    if (success) {
      return NextResponse.json({ success: true, progress })
    } else {
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in progress POST:", error)
    return NextResponse.json({ error: "Failed to save user progress" }, { status: 500 })
  }
}
