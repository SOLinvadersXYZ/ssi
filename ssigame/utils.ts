// Utility functions for the game

// Check collision between two objects
export function checkCollision(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number },
) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  )
}

// Generate random number within range
export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// Calculate distance between two points
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

// Clamp value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Lerp (linear interpolation)
export function lerp(start: number, end: number, amount: number): number {
  return (1 - amount) * start + amount * end
}

// Save data to localStorage
export function saveToLocalStorage(key: string, data: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

// Load data from localStorage
export function loadFromLocalStorage(key: string, defaultValue: any): any {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch (error) {
    console.error("Error loading from localStorage:", error)
    return defaultValue
  }
}

// Format number with leading zeros
export function formatNumber(num: number, length: number): string {
  return String(num).padStart(length, "0")
}

// Check if device is mobile
export function isMobileDevice(): boolean {
  // Check for touch capability first
  const hasTouchScreen =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - MS Surface detection
    navigator.msMaxTouchPoints > 0

  // Check for mobile user agent
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Check screen size as an additional indicator
  const isSmallScreen = window.innerWidth <= 1024

  // Consider it a mobile device if it has touch capability AND either has a mobile user agent OR a small screen
  return hasTouchScreen && (isMobileUserAgent || isSmallScreen)
}

// Add this function to detect screen orientation
export function getScreenOrientation(): "portrait" | "landscape" {
  if (window.matchMedia("(orientation: portrait)").matches) {
    return "portrait"
  } else {
    return "landscape"
  }
}

// Add this function to optimize performance on mobile devices
export function optimizeForMobile() {
  // Check if we're on a mobile device
  if (!isMobileDevice()) return

  // Reduce animation quality or complexity based on device performance
  const isLowEndDevice =
    // Check for low memory (if available in browser)
    // @ts-ignore - deviceMemory is not in all browsers
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    // Or check for low-end processors via hardwareConcurrency
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)

  return {
    // Return optimization settings
    reducedParticles: isLowEndDevice,
    reducedEffects: isLowEndDevice,
    reducedAnimations: isLowEndDevice,
    // Recommended frame rate
    targetFPS: isLowEndDevice ? 30 : 60,
  }
}

// Debounce function
export function debounce(func: Function, wait: number): (...args: any[]) => void {
  let timeout: number | undefined

  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
  }
}

// Create a simple event emitter
export class EventEmitter {
  private events: Record<string, Function[]> = {}

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(listener)
  }

  off(event: string, listener: Function): void {
    if (!this.events[event]) return
    this.events[event] = this.events[event].filter((l) => l !== listener)
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return
    this.events[event].forEach((listener) => listener(...args))
  }
}

// Handle vibration
export function vibrate(pattern: number | number[]): void {
  // Check if vibration is supported and enabled
  if ("vibrate" in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.error("Vibration failed:", error)
    }
  }
}
