import { gameState } from "./game-state"
import type { SoundEffects } from "./types"

class SoundManager {
  private sounds: SoundEffects = {}
  private music: HTMLAudioElement | null = null
  private currentMusic = ""
  private isMusicPlaying = false

  // Load and initialize all sounds
  async initialize(): Promise<void> {
    // Load sound effects
    this.loadSound("shoot", "/sounds/shoot.mp3")
    this.loadSound("explosion", "/sounds/explosion.mp3")
    this.loadSound("powerup", "/sounds/powerup.mp3")
    this.loadSound("damage", "/sounds/damage.mp3")
    this.loadSound("menu", "/sounds/menu.mp3")
    this.loadSound("boss", "/sounds/boss-alert.mp3")
    this.loadSound("levelup", "/sounds/levelup.mp3")
    this.loadSound("shield", "/sounds/shield.mp3")
    this.loadSound("gameover", "/sounds/gameover.mp3")

    // Load music tracks
    this.preloadMusic("title", "/music/title.mp3")
    this.preloadMusic("gameplay", "/music/gameplay.mp3")
    this.preloadMusic("boss", "/music/boss.mp3")

    // Listen for settings changes
    gameState.on("settingsChange", this.handleSettingsChange.bind(this))
  }

  // Load a sound effect
  private loadSound(name: string, path: string): void {
    const audio = new Audio()
    audio.src = path
    audio.preload = "auto"
    this.sounds[name] = audio

    // Set initial volume
    const settings = gameState.getSettings()
    audio.volume = settings.soundVolume
  }

  // Preload music track
  private preloadMusic(name: string, path: string): void {
    const audio = new Audio()
    audio.src = path
    audio.preload = "auto"
    audio.loop = true

    // Set initial volume
    const settings = gameState.getSettings()
    audio.volume = settings.musicVolume

    // Store in sounds collection
    this.sounds[`music_${name}`] = audio
  }

  // Play a sound effect
  playSound(name: string): void {
    const settings = gameState.getSettings()
    if (!settings.soundEnabled || !this.sounds[name]) return

    // Clone the audio to allow overlapping sounds
    const sound = this.sounds[name].cloneNode(true) as HTMLAudioElement
    sound.volume = settings.soundVolume
    sound.play().catch((e) => console.error("Error playing sound:", e))
  }

  // Play music track
  playMusic(name: string): void {
    const settings = gameState.getSettings()
    const musicKey = `music_${name}`

    // Don't restart if already playing the same track
    if (this.currentMusic === musicKey && this.isMusicPlaying) return

    // Stop current music
    this.stopMusic()

    if (settings.musicEnabled && this.sounds[musicKey]) {
      this.music = this.sounds[musicKey].cloneNode(true) as HTMLAudioElement
      this.music.loop = true
      this.music.volume = settings.musicVolume
      this.music.play().catch((e) => console.error("Error playing music:", e))
      this.currentMusic = musicKey
      this.isMusicPlaying = true
    }
  }

  // Stop music
  stopMusic(): void {
    if (this.music && this.isMusicPlaying) {
      this.music.pause()
      this.music.currentTime = 0
      this.isMusicPlaying = false
    }
  }

  // Pause music
  pauseMusic(): void {
    if (this.music && this.isMusicPlaying) {
      this.music.pause()
      this.isMusicPlaying = false
    }
  }

  // Resume music
  resumeMusic(): void {
    const settings = gameState.getSettings()
    if (this.music && settings.musicEnabled && !this.isMusicPlaying) {
      this.music.play().catch((e) => console.error("Error resuming music:", e))
      this.isMusicPlaying = true
    }
  }

  // Set sound volume
  setSoundVolume(volume: number): void {
    Object.keys(this.sounds).forEach((key) => {
      if (!key.startsWith("music_")) {
        this.sounds[key].volume = volume
      }
    })
  }

  // Set music volume
  setMusicVolume(volume: number): void {
    Object.keys(this.sounds).forEach((key) => {
      if (key.startsWith("music_")) {
        this.sounds[key].volume = volume
      }
    })

    if (this.music) {
      this.music.volume = volume
    }
  }

  // Handle settings changes
  private handleSettingsChange(settings: any): void {
    // Update sound volume
    this.setSoundVolume(settings.soundVolume)

    // Update music volume
    this.setMusicVolume(settings.musicVolume)

    // Handle music enable/disable
    if (!settings.musicEnabled && this.isMusicPlaying) {
      this.pauseMusic()
    } else if (settings.musicEnabled && !this.isMusicPlaying && this.music) {
      this.resumeMusic()
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager()
