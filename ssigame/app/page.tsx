"use client";

import Link from "next/link"
import { usePrivy } from "@privy-io/react-auth"
import { useAppLoading } from "@/hooks/use-app-loading"
import { HomeSkeleton } from "@/components/ui/app-skeleton"
import { useEffect, useState } from "react"

export default function Home() {
  const { login, authenticated, user, ready } = usePrivy();
  const { isDataPreloaded, getCachedData } = useAppLoading();
  const [userStats, setUserStats] = useState<any>(null);

  // Load cached user data when available
  useEffect(() => {
    if (isDataPreloaded && authenticated) {
      const cachedProfile = getCachedData('userProfile');
      if (cachedProfile) {
        setUserStats(cachedProfile);
      }
    }
  }, [isDataPreloaded, authenticated, getCachedData]);

  // Show skeleton while data is loading
  if (!ready || !isDataPreloaded) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 mb-6 font-mono animate-pulse">
          S.S.I.
        </h1>
        <p className="text-xl md:text-2xl text-yellow-300 mb-4 font-mono">SOL SPACE INVADERS</p>
        
        {/* Show user stats if available */}
        {authenticated && userStats && (
          <div className="text-sm text-gray-400 font-mono">
            Best Score: {userStats.highScore || 0} • Level: {userStats.maxLevel || 1}
          </div>
        )}
      </div>

      {/* Wallet Connection Status */}
      <div className="mb-8 text-center">
        {authenticated ? (
          <div className="p-4 bg-green-900/30 rounded-lg border border-green-500 transition-all duration-300">
            <p className="text-green-400 font-mono mb-2">✓ Wallet Connected</p>
            <p className="text-sm text-gray-300 font-mono">
              {user?.wallet?.address ? (
                <span>Address: {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}</span>
              ) : (
                <span>Ready to play!</span>
              )}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-500 transition-all duration-300">
            <p className="text-yellow-400 font-mono mb-2">Connect your wallet to play</p>
            <button
              type="button"
              onClick={() => login()}
              className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-all duration-200 text-center font-mono text-lg mt-2 transform hover:scale-105"
            >
              CONNECT WALLET
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <Link
          href="/game"
          className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-all duration-200 text-center font-mono text-lg transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25"
        >
          PLAY GAME
        </Link>
        <Link
          href="/leaderboard"
          className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 text-center font-mono text-lg transform hover:scale-105 shadow-lg hover:shadow-gray-500/25"
        >
          LEADERBOARD
        </Link>
        <Link
          href="/profile"
          className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 text-center font-mono text-lg transform hover:scale-105 shadow-lg hover:shadow-gray-500/25"
        >
          MY PROFILE
        </Link>
      </div>

      <div className="max-w-2xl text-center">
        <p className="text-gray-400 mb-4 font-mono leading-relaxed">
          Defend the galaxy as Bonk in this retro arcade shooter. Collect power-ups, defeat bosses, and compete for the
          highest score!
        </p>
        <p className="text-yellow-300 font-mono">Powered by BSI tokens on Solana</p>
        
        {/* Quick stats from cached leaderboard */}
        {isDataPreloaded && (() => {
          const leaderboard = getCachedData<{all: any[], weekly: any[], monthly: any[]}>('leaderboard');
          if (leaderboard?.all && leaderboard.all.length > 0) {
            const topPlayer = leaderboard.all[0];
            return (
              <div className="mt-6 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 font-mono mb-1">Current High Score</p>
                <p className="text-yellow-400 font-mono font-bold">
                  {topPlayer.score?.toLocaleString() || 0} by {topPlayer.username || 'Anonymous'}
                </p>
              </div>
            );
          }
        })()}
      </div>
    </div>
  )
}
