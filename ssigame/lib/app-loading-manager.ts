"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

// Loading states interface
export interface LoadingState {
  isAppReady: boolean
  isNavbarReady: boolean
  isAuthReady: boolean
  isDataPreloaded: boolean
  currentPage: string
  loadingProgress: number
  error: string | null
}

// Simple cache interface
interface AppCache {
  [key: string]: {
    data: any
    timestamp: number
  }
}

class AppLoadingManager {
  private cache: AppCache = {}
  private loadingState: LoadingState = {
    isAppReady: false,
    isNavbarReady: false,
    isAuthReady: false,
    isDataPreloaded: false,
    currentPage: '',
    loadingProgress: 0,
    error: null
  }
  private listeners: Array<(state: LoadingState) => void> = []

  // Subscribe to loading state changes
  subscribe(listener: (state: LoadingState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  // Notify all listeners of state changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.loadingState }))
  }

  // Update loading state
  private updateState(updates: Partial<LoadingState>) {
    this.loadingState = { ...this.loadingState, ...updates }
    this.notifyListeners()
  }

  // Initialize app loading
  async initializeApp(currentPage: string) {
    this.updateState({ 
      currentPage, 
      loadingProgress: 0,
      error: null 
    })

    try {
      // Phase 1: Critical resources
      this.updateState({ loadingProgress: 25 })
      await this.preloadCriticalResources()
      
      this.updateState({ 
        isAuthReady: true,
        isNavbarReady: true,
        loadingProgress: 50 
      })

      // Phase 2: Page data
      this.updateState({ loadingProgress: 75 })
      await this.preloadPageData(currentPage)
      
      this.updateState({ 
        isDataPreloaded: true,
        loadingProgress: 90 
      })

      // Phase 3: Complete
      this.updateState({ 
        isAppReady: true,
        loadingProgress: 100 
      })

    } catch (error) {
      console.error('App initialization error:', error)
      this.updateState({ 
        error: error instanceof Error ? error.message : 'Failed to initialize app',
        loadingProgress: 0
      })
    }
  }

  // Preload critical resources
  private async preloadCriticalResources() {
    // Small delay to ensure smooth loading animation
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  // Preload page-specific data
  private async preloadPageData(page: string) {
    // Small delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  // Get current state
  getState(): LoadingState {
    return { ...this.loadingState }
  }

  // Clear cache
  clearCache() {
    this.cache = {}
  }
}

// Create singleton instance
export const appLoadingManager = new AppLoadingManager()

// React hook for using the loading manager
export function useAppLoading(currentPage: string) {
  const [loadingState, setLoadingState] = useState<LoadingState>(
    appLoadingManager.getState()
  )
  const initialized = useRef(false)

  useEffect(() => {
    // Subscribe to loading state changes
    const unsubscribe = appLoadingManager.subscribe(setLoadingState)

    // Initialize app if not already done
    if (!initialized.current) {
      initialized.current = true
      appLoadingManager.initializeApp(currentPage)
    }

    return unsubscribe
  }, [currentPage])

  const clearCache = useCallback(() => {
    appLoadingManager.clearCache()
  }, [])

  return {
    ...loadingState,
    clearCache
  }
}