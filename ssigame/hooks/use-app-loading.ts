"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Loading states interface
export interface LoadingState {
  isAppReady: boolean
  isNavbarReady: boolean
  isAuthReady: boolean
  isDataPreloaded: boolean
  loadingProgress: number
  error: string | null
}

// Cache interface
interface AppCache {
  [key: string]: {
    data: any
    timestamp: number
    expiry: number
  }
}

// Global cache instance
let globalCache: AppCache = {}

// Cache expiry times (in milliseconds)
const CACHE_EXPIRY = {
  leaderboard: 5 * 60 * 1000, // 5 minutes
  userProfile: 10 * 60 * 1000, // 10 minutes
  rewards: 2 * 60 * 1000, // 2 minutes
  friends: 5 * 60 * 1000, // 5 minutes
  challenges: 5 * 60 * 1000, // 5 minutes
  default: 5 * 60 * 1000 // Default 5 minutes
}

// Helper function to check if cached data is valid
function isCacheValid(key: string): boolean {
  const cached = globalCache[key]
  if (!cached) return false
  return Date.now() < cached.timestamp + cached.expiry
}

// Helper function to get cached data
function getCachedData<T>(key: string): T | null {
  if (isCacheValid(key)) {
    return globalCache[key].data as T
  }
  return null
}

// Helper function to set cached data
function setCachedData(key: string, data: any, customExpiry?: number) {
  const expiry = customExpiry || CACHE_EXPIRY[key as keyof typeof CACHE_EXPIRY] || CACHE_EXPIRY.default
  globalCache[key] = {
    data,
    timestamp: Date.now(),
    expiry
  }
}

// Preload functions
async function preloadCriticalResources(): Promise<void> {
  const promises: Promise<void>[] = []

  // Preload fonts
  if (typeof window !== 'undefined') {
    promises.push(preloadFont('Press Start 2P'))
    
    // Preload critical images
    promises.push(preloadImage('/favicon-32x32.png'))
    promises.push(preloadImage('/placeholder-logo.svg'))
  }

  await Promise.allSettled(promises)
}

async function preloadFont(fontFamily: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    // Check if font is already loaded
    if (document.fonts && document.fonts.check) {
      if (document.fonts.check(`12px "${fontFamily}"`)) {
        resolve()
        return
      }
    }

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.onload = () => resolve()
    link.onerror = () => resolve() // Don't fail on font errors
    
    if (fontFamily === 'Press Start 2P') {
      link.href = 'https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivNm4I81.woff2'
    }
    
    document.head.appendChild(link)
  })
}

async function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }

    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve() // Don't fail on image errors
    img.src = src
  })
}

async function preloadPageData(page: string): Promise<void> {
  const promises: Promise<void>[] = []

  switch (page) {
    case '/':
      promises.push(preloadUserProfile())
      break
    case '/leaderboard':
      promises.push(preloadLeaderboard())
      break
    case '/rewards':
      promises.push(preloadRewards())
      break
    case '/friends':
      promises.push(preloadFriends())
      break
    case '/challenges':
      promises.push(preloadChallenges())
      break
    case '/game':
      promises.push(preloadGameAssets())
      break
    default:
      promises.push(preloadUserProfile())
  }

  await Promise.allSettled(promises)
}

async function preloadUserProfile(): Promise<void> {
  if (isCacheValid('userProfile')) return

  try {
    const response = await fetch('/api/progress')
    if (response.ok) {
      const data = await response.json()
      setCachedData('userProfile', data)
    }
  } catch (error) {
    console.warn('Failed to preload user profile:', error)
  }
}

async function preloadLeaderboard(): Promise<void> {
  if (isCacheValid('leaderboard')) return

  try {
    const [all, weekly, monthly] = await Promise.all([
      fetch('/api/leaderboard?timeframe=all').then(r => r.json()),
      fetch('/api/leaderboard?timeframe=weekly').then(r => r.json()),
      fetch('/api/leaderboard?timeframe=monthly').then(r => r.json())
    ])

    setCachedData('leaderboard', {
      all: all.leaderboard || [],
      weekly: weekly.leaderboard || [],
      monthly: monthly.leaderboard || []
    })
  } catch (error) {
    console.warn('Failed to preload leaderboard:', error)
  }
}

async function preloadRewards(): Promise<void> {
  if (isCacheValid('rewards')) return

  try {
    const response = await fetch('/api/rewards')
    if (response.ok) {
      const data = await response.json()
      setCachedData('rewards', data)
    }
  } catch (error) {
    console.warn('Failed to preload rewards:', error)
  }
}

async function preloadFriends(): Promise<void> {
  if (isCacheValid('friends')) return

  try {
    const response = await fetch('/api/friends')
    if (response.ok) {
      const data = await response.json()
      setCachedData('friends', data)
    }
  } catch (error) {
    console.warn('Failed to preload friends:', error)
  }
}

async function preloadChallenges(): Promise<void> {
  if (isCacheValid('challenges')) return

  try {
    const response = await fetch('/api/challenges')
    if (response.ok) {
      const data = await response.json()
      setCachedData('challenges', data)
    }
  } catch (error) {
    console.warn('Failed to preload challenges:', error)
  }
}

async function preloadGameAssets(): Promise<void> {
  const promises: Promise<void>[] = []

  // Preload game images
  promises.push(preloadImage('/images/sun-background.png'))
  
  // Preload game sounds
  if (typeof window !== 'undefined') {
    const sounds = [
      '/sounds/shoot.MP3',
      '/sounds/explosion.mp3',
      '/sounds/powerup.mp3',
      '/sounds/menu.mp3'
    ]
    
    sounds.forEach(src => {
      promises.push(new Promise<void>((resolve) => {
        const audio = new Audio()
        audio.preload = 'metadata'
        audio.oncanplaythrough = () => resolve()
        audio.onerror = () => resolve()
        audio.src = src
      }))
    })
  }

  await Promise.allSettled(promises)
}

// Main hook
export function useAppLoading() {
  const pathname = usePathname()
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isAppReady: false,
    isNavbarReady: false,
    isAuthReady: false,
    isDataPreloaded: false,
    loadingProgress: 0,
    error: null
  })
  const initialized = useRef(false)

  const initializeApp = useCallback(async (currentPage: string) => {
    try {
      setLoadingState(prev => ({ ...prev, loadingProgress: 0, error: null }))

      // Phase 1: Critical resources (auth, navbar)
      setLoadingState(prev => ({ ...prev, loadingProgress: 20 }))
      await preloadCriticalResources()
      
      setLoadingState(prev => ({ 
        ...prev, 
        isAuthReady: true,
        isNavbarReady: true,
        loadingProgress: 50 
      }))

      // Phase 2: Page-specific data
      setLoadingState(prev => ({ ...prev, loadingProgress: 70 }))
      await preloadPageData(currentPage)
      
      setLoadingState(prev => ({ 
        ...prev, 
        isDataPreloaded: true,
        loadingProgress: 90 
      }))

      // Phase 3: App ready
      setLoadingState(prev => ({ 
        ...prev, 
        isAppReady: true,
        loadingProgress: 100 
      }))

    } catch (error) {
      console.error('App initialization error:', error)
      setLoadingState(prev => ({ 
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize app',
        loadingProgress: 0
      }))
    }
  }, [])

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      initializeApp(pathname)
    }
  }, [pathname, initializeApp])

  // Memoized functions
  const getCachedDataMemo = useCallback(<T>(key: string): T | null => {
    return getCachedData<T>(key)
  }, [])

  const clearCache = useCallback(() => {
    globalCache = {}
  }, [])

  const refreshData = useCallback((key: string) => {
    delete globalCache[key]
  }, [])

  return {
    ...loadingState,
    getCachedData: getCachedDataMemo,
    clearCache,
    refreshData
  }
} 