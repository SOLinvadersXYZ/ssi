import { type NextRequest, NextResponse } from "next/server"
import { saveFriendRequest, getUserFriends, updateFriendStatus } from "@/lib/database"
import { verifyPrivyToken } from "@/lib/privy"

// GET endpoint to fetch user's friends
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

    // Fetch user's friends
    const friends = await getUserFriends(user.id)

    return NextResponse.json({ friends })
  } catch (error) {
    console.error("Error in friends GET:", error)
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
  }
}

// POST endpoint to send a friend request
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
    const { friendId, friendUsername } = body

    if (!friendId || !friendUsername) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if friend request already exists
    const existingFriends = await getUserFriends(user.id)
    const existingFriend = existingFriends.find(
      (friend) =>
        (friend.userId === user.id && friend.friendId === friendId) ||
        (friend.userId === friendId && friend.friendId === user.id),
    )

    if (existingFriend) {
      return NextResponse.json(
        { error: "Friend request already exists", status: existingFriend.status },
        { status: 400 },
      )
    }

    // Create friend request
    const friendRequest = {
      userId: user.id,
      friendId,
      username: user.email?.split("@")[0] || "Anonymous",
      friendUsername,
    }

    // Save to database
    const success = await saveFriendRequest(friendRequest)

    if (success) {
      return NextResponse.json({ success: true, friendRequest })
    } else {
      return NextResponse.json({ error: "Failed to save friend request" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in friends POST:", error)
    return NextResponse.json({ error: "Failed to send friend request" }, { status: 500 })
  }
}

// PATCH endpoint to update friend request status
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
    const { friendId, status } = body

    if (!friendId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate status
    if (status !== "accepted" && status !== "rejected") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update friend request status
    const success = await updateFriendStatus(user.id, friendId, status)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to update friend request" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in friends PATCH:", error)
    return NextResponse.json({ error: "Failed to update friend request" }, { status: 500 })
  }
}
