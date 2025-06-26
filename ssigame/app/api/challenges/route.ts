import { type NextRequest, NextResponse } from "next/server"
import {
  saveChallenge,
  getUserChallenges,
  getChallenge,
  updateChallengeStatus,
  getUserFriends,
} from "@/lib/database"
import { verifyPrivyToken } from "@/lib/privy"
import { v4 as uuidv4 } from "uuid"

// GET endpoint to fetch user's challenges
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
    const challengeId = searchParams.get("id")

    if (challengeId) {
      // Fetch specific challenge
      const challenge = await getChallenge(challengeId)

      if (!challenge) {
        return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
      }

      // Verify user is part of this challenge
      if (challenge.challengerId !== user.id && challenge.challengeeId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      return NextResponse.json({ challenge })
    } else {
      // Fetch all user challenges
      const challenges = await getUserChallenges(user.id)
      return NextResponse.json({ challenges })
    }
  } catch (error) {
    console.error("Error in challenges GET:", error)
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 })
  }
}

// POST endpoint to create a challenge
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
    const { friendId, friendUsername, score, level } = body

    if (!friendId || !friendUsername || !score || !level) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify they are friends
    const friends = await getUserFriends(user.id)
    const isFriend = friends.some(
      (friend) =>
        ((friend.userId === user.id && friend.friendId === friendId) ||
          (friend.userId === friendId && friend.friendId === user.id)) &&
        friend.status === "ACCEPTED",
    )

    if (!isFriend) {
      return NextResponse.json({ error: "You can only challenge friends" }, { status: 400 })
    }

    // Create challenge
    const challenge = {
      id: uuidv4(),
      challengerId: user.id,
      challengerUsername: user.email?.split("@")[0] || "Anonymous",
      challengeeId: friendId,
      challengeeUsername: friendUsername,
      score,
      level,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    }

    // Save to database
    const success = await saveChallenge(challenge)

    if (success) {
      return NextResponse.json({ success: true, challenge })
    } else {
      return NextResponse.json({ error: "Failed to save challenge" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in challenges POST:", error)
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 })
  }
}

// PATCH endpoint to update challenge status
export async function PATCH(request: NextRequest) {
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
    const { challengeId, status, score, level } = body

    if (!challengeId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate status
    if (!["accepted", "completed", "expired"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get the challenge
    const challenge = await getChallenge(challengeId)
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Verify user is part of this challenge
    if (challenge.challengerId !== user.id && challenge.challengeeId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For "accepted" status, verify user is the challengee
    if (status === "accepted" && challenge.challengeeId !== user.id) {
      return NextResponse.json({ error: "Only the challengee can accept a challenge" }, { status: 400 })
    }

    // For "completed" status, verify user is the challengee and score is provided
    if (status === "completed") {
      if (challenge.challengeeId !== user.id) {
        return NextResponse.json({ error: "Only the challengee can complete a challenge" }, { status: 400 })
      }

      if (!score || !level) {
        return NextResponse.json({ error: "Score and level are required to complete a challenge" }, { status: 400 })
      }
    }

    // Determine winner for completed challenges
    let winnerId = undefined
    if (status === "completed") {
      winnerId = score > challenge.score ? user.id : challenge.challengerId
    }

    // Update challenge status
    const success = await updateChallengeStatus(challengeId, status as any, {
      score,
      level,
      winnerId,
    })

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in challenges PATCH:", error)
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 })
  }
}
