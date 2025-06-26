import { gameState } from "./game-state"
import type { SoundEffects } from "./types"

class SoundManager {
  private sounds: SoundEffects = {}
  private music: HTMLAudioElement | null = null
  private currentMusic = ""
  private isMusicPlaying = false
  private playingSounds: { [key: string]: HTMLAudioElement } = {}
  private loadedSounds: Set<string> = new Set()
  private loadedMusic: Set<string> = new Set()
  private isInitialized = false

  // Load and initialize all sounds
  async initialize(): Promise<void> {
    // Load sound effects
    this.loadSound("shoot", "/sounds/shoot.MP3")
    this.loadSound("explosion", "/sounds/explosion.mp3")
    this.loadSound("powerup", "/sounds/powerup.mp3")
    this.loadSound("damage", "/sounds/damage.mp3")
    this.loadSound("menu", "/sounds/menu.mp3")
    this.loadSound("boss", "/sounds/boss-alert.mp3")
    this.loadSound("levelup", "/sounds/levelup.mp3")
    this.loadSound("shield", "/sounds/shield.mp3")
    this.loadSound("gameover", "/sounds/gameover.mp3")

    // Load music tracks (only existing files)
    this.preloadMusic("title", "/music/title.mp3")
    
    // Load level-specific music tracks
    this.preloadMusic("level1", "/music/level1.mp3")
    this.preloadMusic("level2", "/music/level2.mp3")
    this.preloadMusic("level3", "/music/level3.mp3")
    this.preloadMusic("level5", "/music/level5.mp3")
    this.preloadMusic("level6", "/music/level6.mp3")

    // Listen for settings changes
    gameState.on("settingsChange", this.handleSettingsChange.bind(this))
    
    // Mark as initialized
    this.isInitialized = true
  }

  // Check if all critical assets are loaded
  isReady(): boolean {
    const requiredSounds = ["shoot", "explosion", "powerup", "damage", "menu", "boss", "levelup", "gameover"]
    const requiredMusic = ["title", "level1", "level2", "level3", "level5", "level6"]
    
    const soundsLoaded = requiredSounds.every(sound => this.loadedSounds.has(sound))
    const musicLoaded = requiredMusic.every(music => this.loadedMusic.has(music))
    
    return this.isInitialized && soundsLoaded && musicLoaded
  }

  // Get loading progress (0-1)
  getLoadingProgress(): number {
    const requiredSounds = ["shoot", "explosion", "powerup", "damage", "menu", "boss", "levelup", "gameover"]
    const requiredMusic = ["title", "level1", "level2", "level3", "level5", "level6"]
    
    const totalAssets = requiredSounds.length + requiredMusic.length
    const loadedAssets = this.loadedSounds.size + this.loadedMusic.size
    
    return Math.min(loadedAssets / totalAssets, 1.0)
  }

  // Load a sound effect with error handling
  private loadSound(name: string, path: string): void {
    const audio = new Audio()
    audio.src = path
    audio.preload = "auto"

    // Set initial volume
    const settings = gameState.getSettings()
    audio.volume = settings.soundVolume

    // Add error handling for missing files
    audio.addEventListener('error', (e) => {
      console.warn(`Failed to load sound file: ${path}`, e)
      // Don't store failed audio files
      return
    })

    // Add load success handler
    audio.addEventListener('canplaythrough', () => {
      console.log(`Successfully preloaded sound: ${name}`)
      this.loadedSounds.add(name)
    })

    // Store in sounds collection
    this.sounds[name] = audio
  }

  // Preload music track with error handling
  private preloadMusic(name: string, path: string): void {
    const audio = new Audio()
    audio.src = path
    audio.preload = "auto"
    audio.loop = true

    // Set initial volume
    const settings = gameState.getSettings()
    audio.volume = settings.musicVolume

    // Add error handling for missing files
    audio.addEventListener('error', (e) => {
      console.warn(`Failed to load music file: ${path}`, e)
      // Don't store failed audio files
      return
    })

    // Add load success handler
    audio.addEventListener('canplaythrough', () => {
      console.log(`Successfully preloaded music: ${name}`)
      this.loadedMusic.add(name)
    })

    // Store in sounds collection
    this.sounds[`music_${name}`] = audio
  }

  // Play a sound effect (single instance only)
  playSound(name: string): void {
    const settings = gameState.getSettings()
    if (!settings.soundEnabled || !this.sounds[name]) return

    // Stop any currently playing instance of this sound
    if (this.playingSounds[name]) {
      this.playingSounds[name].pause()
      this.playingSounds[name].currentTime = 0
    }

    // Create new instance and play
    const sound = this.sounds[name].cloneNode(true) as HTMLAudioElement
    sound.volume = settings.soundVolume
    
    // Track this sound instance
    this.playingSounds[name] = sound
    
    // Clean up when sound ends
    sound.addEventListener('ended', () => {
      delete this.playingSounds[name]
    })
    
    sound.play().catch((e) => console.error("Error playing sound:", e))
  }

  // Play music track with fallback handling
  playMusic(name: string): void {
    const settings = gameState.getSettings()
    const musicKey = `music_${name}`

    // Don't restart if already playing the same track
    if (this.currentMusic === musicKey && this.isMusicPlaying) return

    // Stop current music
    this.stopMusic()

    if (settings.musicEnabled) {
      // Check if the requested music exists, otherwise try fallbacks
      let fallbackMusic = musicKey
      if (!this.sounds[musicKey]) {
        console.warn(`Music track not found: ${name}, trying fallbacks`)
        
        // Try fallback options in order of preference
        const fallbacks = ["music_title", "music_level1", "music_level2", "music_level3"]
        for (const fallback of fallbacks) {
          if (this.sounds[fallback]) {
            fallbackMusic = fallback
            break
          }
        }
      }

      if (this.sounds[fallbackMusic]) {
        this.music = this.sounds[fallbackMusic].cloneNode(true) as HTMLAudioElement
        this.music.loop = true
        this.music.volume = settings.musicVolume
        this.music.play().catch((e) => console.error("Error playing music:", e))
        this.currentMusic = fallbackMusic
        this.isMusicPlaying = true
      } else {
        console.warn("No music tracks available to play")
      }
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

  // Play level-specific music
  playLevelMusic(levelNumber: number): void {
    // Map level numbers to available music files
    const levelMusicMap: { [key: number]: string } = {
      1: "level1",
      2: "level2",
      3: "level3",
      4: "level3", // Fallback to level3 music since level4.mp3 is missing
      5: "level5",
      6: "level6"
    }
    
    const musicName = levelMusicMap[levelNumber] || "level1" // Default fallback to level1
    this.playMusic(musicName)
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
