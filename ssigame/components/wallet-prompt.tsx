"use client"

import { usePrivy } from "@privy-io/react-auth"

interface WalletPromptProps {
  onPlayAsGuest: () => void
}

export const WalletPrompt = ({ onPlayAsGuest }: WalletPromptProps) => {
  const { login } = usePrivy()

  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-30">
      <div className="bg-gray-900 border-2 border-yellow-500 p-6 max-w-md w-full text-center">
        <h2 className="text-xl text-yellow-400 font-bold mb-4 font-mono">CONNECT WALLET</h2>
        <p className="text-white font-mono mb-6">Connect your wallet to save high scores and earn rewards!</p>
        <div className="space-y-4">
          <button
            onClick={login}
            className="w-full px-6 py-3 bg-yellow-500 text-black font-bold font-mono hover:bg-yellow-400 transition-colors"
          >
            CONNECT WALLET
          </button>          <button 
            onClick={onPlayAsGuest}
            className="w-full px-6 py-3 bg-gray-700 text-white font-mono hover:bg-gray-600 transition-colors"
          >
            PLAY AS GUEST
          </button>
        </div>
      </div>
    </div>
  )
}
