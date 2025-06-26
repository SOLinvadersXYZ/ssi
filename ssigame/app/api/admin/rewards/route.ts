import { type NextRequest, NextResponse } from "next/server"
import { updateRewardClaimStatus } from "@/lib/database"
import { verifyPrivyToken } from "@/lib/privy"
import { TOKEN_CONFIG } from "@/config/token-config"

// PATCH endpoint to update reward claim status
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const user = await verifyPrivyToken(token)

    if (!user || user.id !== TOKEN_CONFIG.adminUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { claimId, status, notes, paymentTxId } = body

    if (!claimId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate status
    if (!["APPROVED", "REJECTED", "PAID"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update reward claim status
    const success = await updateRewardClaimStatus(
      claimId,
      status as "APPROVED" | "REJECTED" | "PAID",
      notes,
      paymentTxId,
    )

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to update claim status" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in admin rewards PATCH:", error)
    return NextResponse.json({ error: "Failed to update reward claim" }, { status: 500 })
  }
}
