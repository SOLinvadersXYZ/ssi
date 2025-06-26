"use client"

import { useEffect, useState } from 'react'

interface LoadingProgressProps {
  progress: number
  title?: string
  subtitle?: string
  showPercentage?: boolean
  className?: string
}

export function LoadingProgress({ 
  progress, 
  title = "Loading...", 
  subtitle,
  showPercentage = true,
  className = ""
}: LoadingProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  // Smooth progress animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress)
    }, 100)
    return () => clearTimeout(timer)
  }, [progress])

  const getLoadingMessage = (progress: number) => {
    if (progress < 25) return "Initializing..."
    if (progress < 50) return "Loading resources..."
    if (progress < 75) return "Preparing data..."
    if (progress < 95) return "Almost ready..."
    return "Ready!"
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2 font-mono">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-400 font-mono text-sm">
            {subtitle}
          </p>
        )}
      </div>

      <div className="w-80 max-w-full">
        {/* Progress bar */}
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-500 ease-out relative"
            style={{ width: `${displayProgress}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Status text */}
        <div className="flex justify-between items-center text-sm font-mono">
          <span className="text-gray-400">
            {getLoadingMessage(displayProgress)}
          </span>
          {showPercentage && (
            <span className="text-yellow-400 font-bold">
              {Math.round(displayProgress)}%
            </span>
          )}
        </div>
      </div>

      {/* Loading dots animation */}
      <div className="mt-6 flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  )
} 