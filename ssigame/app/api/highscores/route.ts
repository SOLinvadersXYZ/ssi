import { type NextRequest, NextResponse } from "next/server"
import { verifyPrivyToken } from "@/lib/privy"

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract and verify the token
    const token = authHeader.split(" ")[1]
    const user = await verifyPrivyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Parse the request body
    const { score, level } = await request.json()

    // Here you would typically save the score to a database
    // For now, we'll just return a success response
    console.log(`Saved score ${score} at level ${level} for user ${user.id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving high score:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Here you would typically fetch high scores from a database
  // For now, we'll just return some dummy data
  const highScores = [
    { userId: "user1", username: "Player1", score: 10000 },
    { userId: "user2", username: "Player2", score: 8500 },
    { userId: "user3", username: "Player3", score: 7200 },
  ]

  return NextResponse.json({ highScores })
}
