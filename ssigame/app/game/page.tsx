"use client"

import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { checkTokenBalance } from "@/lib/solana"
import BonkShooter from "@/bonk-shooter"
import { TOKEN_CONFIG } from "@/config/token-config"

export default function GamePage() {
  const { user, authenticated, ready } = usePrivy()
  const [hasTokens, setHasTokens] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAccess() {
      if (ready) {
        // If not authenticated, redirect to login page
        if (!authenticated) {
          router.push("/")
          return
        }

        // Check token balance if wallet is connected
        if (user?.wallet?.address) {
          try {
            console.log("Checking token balance for wallet:", user.wallet.address)
            const hasEnoughTokens = await checkTokenBalance(user.wallet.address)
            console.log("Has enough tokens:", hasEnoughTokens)
            setHasTokens(hasEnoughTokens)
          } catch (error) {
            console.error("Error checking token balance:", error)
            // For development, allow game to start even if token check fails
            setHasTokens(true)
          }
        } else {
          // For development, allow game to start even without a wallet
          console.log("No wallet connected, but allowing game to start for development")
          setHasTokens(true)
        }

        setLoading(false)
      }
    }

    checkAccess()
  }, [authenticated, ready, router, user?.wallet?.address])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <div className="text-yellow-500 text-2xl font-mono mb-4">Loading Game...</div>
        <div className="w-64 h-4 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500 animate-pulse w-4/5" />
        </div>
      </div>
    )
  }

  if (!hasTokens) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <div className="max-w-md w-full bg-gray-900 border-2 border-red-500 p-8 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4 font-mono">Access Denied</h1>
          <p className="text-white font-mono mb-6">You need 1 BSI token to play this game.</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-yellow-500 text-black font-bold font-mono rounded-md hover:bg-yellow-400 transition-colors"
          >
            RETURN TO LOGIN
          </button>
        </div>
      </div>
    )
  }

  return <BonkShooter />
}
