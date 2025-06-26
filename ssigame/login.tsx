"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useEffect, useState } from "react"
import { checkTokenBalance, createPaymentTransaction } from "@/lib/solana"
import { TOKEN_CONFIG } from "@/config/token-config"
import { useRouter } from "next/navigation"

export default function Login() {
  const { login, authenticated, user, ready, sendTransaction } = usePrivy()
  const [loading, setLoading] = useState(true)
  const [hasTokens, setHasTokens] = useState(false)
  const [checkingBalance, setCheckingBalance] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const router = useRouter()

  // Game owner wallet to receive payments
  const GAME_OWNER_WALLET = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" // Replace with actual owner wallet

  useEffect(() => {
    if (ready) {
      setLoading(false)
    }
  }, [ready])

  // Check token balance when user is authenticated
  useEffect(() => {
    async function checkBalance() {
      if (authenticated && user?.wallet?.address) {
        setCheckingBalance(true)
        try {
          const hasEnoughTokens = await checkTokenBalance(user.wallet.address)
          setHasTokens(hasEnoughTokens)
        } catch (error) {
          console.error("Error checking token balance:", error)
          setHasTokens(false)
        } finally {
          setCheckingBalance(false)
        }
      }
    }

    checkBalance()
  }, [authenticated, user?.wallet?.address])

  // Handle payment for the game
  const handlePayment = async () => {
    if (!authenticated || !user?.wallet?.address) {
      return
    }

    setProcessingPayment(true)
    setPaymentError(null)

    try {
      // Create the payment transaction
      const transaction = await createPaymentTransaction(user.wallet.address, GAME_OWNER_WALLET)

      if (!transaction) {
        throw new Error("Failed to create payment transaction")
      }

      // Send the transaction using Privy
      const result = await sendTransaction({
        ...transaction,
        chainId: 103, // Solana mainnet-beta chain ID
      })

      if (result.hash) {
        // Update token balance state
        setHasTokens(true)

        // Redirect to game
        router.push("/game")
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      setPaymentError(error.message || "Failed to process payment. Please try again.")
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <div className="text-yellow-500 text-2xl font-mono mb-4">Loading...</div>
        <div className="w-64 h-4 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500 animate-pulse" style={{ width: "60%" }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <div className="max-w-md w-full bg-gray-900 border-2 border-yellow-500 p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-yellow-500 mb-2 font-mono text-center">S.S.I.</h1>
        <h2 className="text-xl text-white mb-8 font-mono text-center">SOL SPACE INVADERS</h2>

        {authenticated ? (
          <div className="text-center">
            <p className="text-green-400 font-mono mb-4">Connected as {user?.email?.address || user?.wallet?.address}</p>

            {checkingBalance ? (
              <div className="mb-4">
                <p className="text-white font-mono">Checking token balance...</p>
                <div className="w-full h-2 bg-gray-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-yellow-500 animate-pulse" style={{ width: "100%" }}></div>
                </div>
              </div>
            ) : hasTokens ? (
              <a
                href="/game"
                className="inline-block px-6 py-3 bg-yellow-500 text-black font-bold font-mono rounded-md hover:bg-yellow-400 transition-colors"
              >
                PLAY GAME
              </a>
            ) : (
              <div>
                <p className="text-white font-mono mb-4">
                  You need 1 {TOKEN_CONFIG.tokenSymbol} token to play this game.
                </p>

                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className={`w-full px-6 py-3 ${
                    processingPayment ? "bg-gray-600 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-400"
                  } text-black font-bold font-mono rounded-md transition-colors`}
                >
                  {processingPayment ? "PROCESSING..." : `PAY 1 ${TOKEN_CONFIG.tokenSymbol} TOKEN`}
                </button>

                {paymentError && <p className="mt-4 text-red-500 font-mono text-sm">{paymentError}</p>}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={login}
            className="w-full px-6 py-3 bg-yellow-500 text-black font-bold font-mono rounded-md hover:bg-yellow-400 transition-colors"
          >
            CONNECT WALLET OR EMAIL
          </button>
        )}

        <div className="mt-8 text-gray-400 text-sm font-mono text-center">
          <p>Connect with your wallet or create a new one with just your email.</p>
          <p className="mt-2">You need 1 {TOKEN_CONFIG.tokenSymbol} token to play!</p>
        </div>
      </div>
    </div>
  )
}
