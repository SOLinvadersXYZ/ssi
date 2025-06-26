export type GameState = "title" | "playing" | "paused" | "gameOver" | "victory"

export interface GameStateEventMap {
  stateChange: { oldState: GameState; newState: GameState }
  scoreChange: number
  levelChange: number
  achievementUnlocked: { id: string; name: string }
  highScoreChange: HighScore[]
  settingsChange: GameSettings
}

export interface GameSettings {
  soundEnabled: boolean
  musicEnabled: boolean
  soundVolume: number
  musicVolume: number
  difficulty: "easy" | "normal" | "hard"
  vibrationEnabled: boolean
  autoShareAchievements?: boolean
}

export interface HighScore {
  name: string
  score: number
  walletAddress?: string
  timestamp: number
}

export interface GameObject {
  x: number
  y: number
  width: number
  height: number
  update(): boolean | void
  updateLogic?(): void // Optional method for time freeze functionality
  draw?(): void // Optional method for separate drawing
}

export interface Enemy extends GameObject {
  projectiles?: Projectile[]
  type: string
  movementPattern?: string
  health?: number
  isBoss?: boolean
  canTeleport?: boolean
  multiShot?: boolean
  color?: string
}

export interface Projectile extends GameObject {
  damage: number
}

export interface Explosion extends GameObject {
  frame: number
  maxFrames: number
}

export interface Particle extends GameObject {
  color: string
  alpha: number
}

export interface WeaponPickup extends GameObject {
  type: string
  weaponType: string
  getWeaponColor(alpha?: number): string
}

export interface PowerUp extends GameObject {
  type: PowerUpType
  duration: number
  getColor(alpha?: number): string
}

export interface Level {
  number: number
  name: string
  enemySpawnRate: number
  enemySpeedMultiplier: number
  bossLevel: boolean
  background: string
  maxEnemies: number
  powerUpChance: number
  specialEnemies?: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  unlocked: boolean
  icon: string
  secret?: boolean
}

export type PowerUpType = "shield" | "speed" | "extraLife" | "bomb" | "timeFreeze"

export interface SoundEffects {
  [key: string]: HTMLAudioElement
}
