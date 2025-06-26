"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"

import {
  pixelArtSun,
  pixelArtExclamation,
  pixelArtShip,
  pixelArtDog,
  pixelArtThrusters,
  colorPalettes,
} from "./pixel-art"

import { gameState } from "./game-state"
import { soundManager } from "./sound-manager"
import { MobileControlsManager, KeyboardManager } from "./controls"
import { checkCollision, vibrate, isMobileDevice, loadFromLocalStorage } from "./utils"
import {
  EnemyImpl,
  BossEnemy,
  ProjectileImpl,
  ExplosionImpl,
  ParticleImpl,
  WeaponPickupImpl,
  PowerUpImpl,
} from "./game-objects"
import type {
  Enemy,
  Explosion,
  GameSettings,
  GameState,
  HighScore,
  Level,
  Particle,
  PowerUp,
  Projectile,
  WeaponPickup,
  Achievement,
} from "./types"
import { ScoreShare } from "@/components/score-share"
import { levels } from "./game-levels"

export default function BonkShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentGameState, setCurrentGameState] = useState<GameState>("title")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lives, setLives] = useState(3)
  const [showSettings, setShowSettings] = useState(false)
  const [showPause, setShowPause] = useState(false)
  const [showHighScores, setShowHighScores] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [showNewHighScore, setShowNewHighScore] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [settings, setSettings] = useState<GameSettings>(gameState.getSettings())
  const [achievementNotification, setAchievementNotification] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const gameLoopRef = useRef<number | null>(null)
  const useBombFnRef = useRef<(() => void) | null>(null)

  const searchParams = useSearchParams()
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [challengeData, setChallengeData] = useState<any>(null)

  // Add this effect to handle challenge parameters
  useEffect(() => {
    const challengeParam = searchParams.get("challenge")
    if (challengeParam) {
      setChallengeId(challengeParam)

      // Fetch challenge data
      async function fetchChallengeData() {
        // if (!authenticated || !user) return

        try {
          // const accessToken = await getAccessToken()
          const accessToken = "test"

          const response = await fetch(`/api/challenges?id=${challengeParam}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            setChallengeData(data.challenge)
          }
        } catch (error) {
          console.error("Error fetching challenge data:", error)
        }
      }

      fetchChallengeData()
    }
  }, [searchParams])

  // Initialize game state
  useEffect(() => {
    // Load high score from localStorage
    const storedHighScores = loadFromLocalStorage("bonkShooterHighScores", []) as HighScore[]
    if (storedHighScores.length > 0) {
      setHighScore(storedHighScores[0].score)
    }

    // Initialize sound system
    soundManager.initialize().then(() => {
      // Play title music once sounds are loaded
      soundManager.playMusic("title")
    })

    // Set up game state listeners
    gameState.on("stateChange", ({ oldState, newState }: { oldState: string, newState: string }) => {
      setCurrentGameState(newState as GameState)

      // Handle music changes based on state transitions
      if (newState === "title" && oldState !== "paused") {
        soundManager.playMusic("title")
      } else if (newState === "playing" && oldState !== "paused") {
        soundManager.playLevelMusic(level)
      } else if (newState === "gameOver") {
        soundManager.playSound("gameover")
      }
    })

    gameState.on("scoreChange", (newScore: number) => {
      setScore(newScore)
    })

    gameState.on("levelChange", (newLevel: number) => {
      setLevel(newLevel)
      soundManager.playSound("levelup")
      // Play level-specific music after level up sound
      setTimeout(() => {
        soundManager.playLevelMusic(newLevel)
      }, 500)
    })

    gameState.on("achievementUnlocked", (achievement: Achievement) => {
      // Show achievement notification
      setAchievementNotification(achievement.name)

      // Hide notification after 3 seconds
      setTimeout(() => {
        setAchievementNotification(null)
      }, 3000)
    })

    // Set up fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Update settings when they change
  useEffect(() => {
    gameState.updateSettings(settings)
  }, [settings])

  // Main game loop
  useEffect(() => {
    if (currentGameState !== "playing" || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Enable pixel art rendering
    ctx.imageSmoothingEnabled = false

    // Initialize input systems
    const keyboardManager = new KeyboardManager()
    // let useBombFn: (() => void) | null = null

    const mobileControlsManager = new MobileControlsManager(
      // Joystick move handler
      (x, y) => {
        player.direction.x = x
        player.direction.y = y
        player.isMoving = x !== 0 || y !== 0
      },
      // Fire button handler
      () => {
        if (shootCooldown <= 0) {
          fireWeapon()
        }
      },
      // Pause button handler
      () => {
        pauseGame()
      },
      // Bomb button handler
      () => {
        if (bombs > 0) {
          if (useBombFnRef.current) {
            useBombFnRef.current()
          }
        }
      },
      // Fire hold handler for continuous shooting
      () => {
        if (shootCooldown <= 0) {
          fireWeapon()
        }
      },
    )

    // Enhanced mobile detection and setup
    if (isMobileDevice()) {
      mobileControlsManager.show()

      // Add meta viewport tag for better mobile experience if not already present
      if (!document.querySelector('meta[name="viewport"]')) {
        const viewportMeta = document.createElement("meta")
        viewportMeta.name = "viewport"
        viewportMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        document.head.appendChild(viewportMeta)
      }

      // Prevent default touch actions to avoid scrolling while playing
      document.body.style.overflow = "hidden"
      document.body.style.touchAction = "none"

      // Add orientation change handler
      window.addEventListener("orientationchange", () => {
        // Brief timeout to allow orientation to complete
        setTimeout(() => {
          if (canvas) {
            // Adjust canvas size based on orientation if needed
            handleCanvasResize()
          }
        }, 300)
      })

      // Add touch-specific event listeners for game actions
      canvas.addEventListener("touchstart", handleTouchStart)
    }

    // Function to handle canvas resizing
    function handleCanvasResize() {
      // Get the container dimensions
      const container = canvas.parentElement
      if (!container) return

      // Maintain aspect ratio while fitting the screen
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      const aspectRatio = 320 / 240

      // Calculate new dimensions
      let newWidth, newHeight
      if (containerWidth / containerHeight > aspectRatio) {
        // Container is wider than needed
        newHeight = containerHeight
        newWidth = newHeight * aspectRatio
      } else {
        // Container is taller than needed
        newWidth = containerWidth
        newHeight = newWidth / aspectRatio
      }

      // Apply new dimensions to canvas style
      canvas.style.width = `${newWidth}px`
      canvas.style.height = `${newHeight}px`
    }

    // Handle canvas touch for additional shooting
    function handleTouchStart(e: TouchEvent) {
      // Prevent default to avoid unwanted behaviors
      e.preventDefault()
      
      // Simple tap to shoot - let the dedicated fire button handle continuous shooting
      if (shootCooldown <= 0) {
        fireWeapon()
      }
    }

    // Show mobile controls if needed
    // if (isMobileDevice()) {
    //   mobileControlsManager.show()
    // }

    // Set up keyboard controls with continuous shooting support
    let isShootingPressed = false
    let continuousShootingTimer = 0
    const continuousShootingRate = 8 // Faster continuous rate

    keyboardManager.onKeyPress(" ", () => {
      isShootingPressed = true
      if (shootCooldown <= 0) {
        fireWeapon()
      }
    })

    // Add keyup listener for space bar to stop continuous shooting
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        isShootingPressed = false
        continuousShootingTimer = 0
      }
    }
    window.addEventListener("keyup", handleKeyUp)

    keyboardManager.onKeyPress("Escape", pauseGame)
    keyboardManager.onKeyPress("p", pauseGame)

    keyboardManager.onKeyPress("b", () => {
      if (bombs > 0) {
        useBomb()
      }
    })

    // Game variables
    const enemies: Enemy[] = []
    const bosses: Enemy[] = []
    const projectiles: Projectile[] = []
    const particles: Particle[] = []
    const explosions: Explosion[] = []
    const stars: any[] = []
    const weaponPickups: WeaponPickup[] = []
    const powerUps: PowerUp[] = []

    let frames = 0
    let localScore = score
    let enemiesDefeated = 0
    let currentLevelIndex = level - 1
    let currentLevelEnemies = 0
    let sunY = canvas.height - 100
    let exclamationVisible = true
    let exclamationTimer = 0
    let screenShake = 0
    let timeFrozen = false
    let timeFreezeCounter = 0
    let bossSpawned = false
    let levelComplete = false
    let levelCompleteTimer = 0
    let perfectLevel = true // Track if player took damage in level

    // Get current level data (will be updated dynamically)
    let currentLevel = levels[currentLevelIndex] || levels[0]

    // Initialize stars
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.floor(Math.random() * canvas.width),
        y: Math.floor(Math.random() * canvas.height),
        size: Math.random() > 0.8 ? 2 : 1,
        color: Math.random() > 0.5 ? colorPalettes.main.white : colorPalettes.main.lightGray,
        blinkRate: Math.floor(Math.random() * 100) + 50,
        type: "star" // Default type for regular stars
      })
    }

    // Player with physics - preserve position if already exists
    const player = {
      x: Math.floor(canvas.width / 2) - 16,
      y: canvas.height - 100,
      width: 32,
      height: 24,
      speed: 0.5, // Acceleration rate
      maxSpeed: 4, // Maximum speed
      friction: 0.9, // Deceleration rate
      velocity: { x: 0, y: 0 },
      thrusterFrame: 0,
      thrusterAnimSpeed: 0.2,
      isMoving: false,
      direction: { x: 0, y: 0 },
      lives: lives,
      invulnerable: false,
      invulnerableTimer: 0,
      shield: 0,
    }

    // Weapon system
    const weaponTypes = ["default", "spread", "rapid", "plasma", "homing"]
    let currentWeapon = "default"
    let weaponTimer = 0
    let shootCooldown = 0
    let bombs = 2

    // Function to fire weapon
    function fireWeapon() {
      // Shoot based on current weapon
      switch (currentWeapon) {
        case "spread":
          // Spread shot - 3 projectiles in a spread pattern
          projectiles.push(
            new ProjectileImpl(player.x + player.width / 2, player.y, 8, 9, colorPalettes.main.orange, "spread"),
          )
          projectiles.push(
            new ProjectileImpl(player.x + player.width / 2, player.y, 8, 9, colorPalettes.main.orange, "spread", -1),
          )
          projectiles.push(
            new ProjectileImpl(player.x + player.width / 2, player.y, 8, 9, colorPalettes.main.orange, "spread", 1),
          )
          shootCooldown = 20
          // Add screen shake
          screenShake = 2
          break

        case "rapid":
          // Rapid fire - faster shooting
          projectiles.push(
            new ProjectileImpl(player.x + player.width / 2, player.y, 6, 6, colorPalettes.main.green, "rapid"),
          )
          shootCooldown = 5
          // Add screen shake
          screenShake = 1
          break

        case "plasma":
          // Plasma - larger projectiles
          projectiles.push(
            new ProjectileImpl(player.x + player.width / 2, player.y, 9, 9, colorPalettes.main.purple, "plasma"),
          )
          shootCooldown = 25
          // Add screen shake
          screenShake = 3
          break

        case "homing":
          // Homing missiles
          const missile = new ProjectileImpl(
            player.x + player.width / 2,
            player.y,
            9,
            12,
            colorPalettes.main.red,
            "homing",
          )
          missile.homing = true
          projectiles.push(missile)
          shootCooldown = 30
          // Add screen shake
          screenShake = 2
          break

        default:
          // Default laser
          projectiles.push(
            new ProjectileImpl(player.x + player.width / 2, player.y, 6, 12, colorPalettes.main.blue, "default"),
          )
          shootCooldown = 15
          // Add screen shake
          screenShake = 1
      }

      // Play sound
      soundManager.playSound("shoot")

      // Vibration feedback
      if (settings.vibrationEnabled) {
        vibrate(20)
      }
    }

    // Use bomb power
    const useBomb = () => {
      if (bombs <= 0) return

      bombs--

      // Create giant explosion
      explosions.push(new ExplosionImpl(canvas.width / 2, canvas.height / 2, 200, colorPalettes.main.yellow))

      // Screen shake
      screenShake = 15

      // Damage all enemies
      enemies.forEach((enemy) => {
        const enemyImpl = enemy as EnemyImpl
        enemyImpl.health -= enemyImpl.isBoss ? 5 : 999

        // If enemy is destroyed
        if (enemyImpl.health <= 0) {
          // Create explosion
          explosions.push(
            new ExplosionImpl(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              enemyImpl.isBoss ? 100 : enemyImpl.isSmall ? 20 : 30,
              enemyImpl.color,
            ),
          )

          // Create explosion particles
          for (let i = 0; i < (enemyImpl.isSmall ? 10 : enemyImpl.isBoss ? 40 : 15); i++) {
            particles.push(
              new ParticleImpl(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 2, enemyImpl.color, {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3,
              }),
            )
          }

          // Increase score based on enemy type
          const points = enemyImpl.isSmall ? 5 : enemyImpl.isBoss ? 500 : 10
          localScore += points
          setScore(localScore) // Update React state
          gameState.addScore(points)
          enemiesDefeated++

          // Record first kill achievement
          if (enemiesDefeated === 1) {
            gameState.recordFirstKill()
          }

          // Boss defeat
          if (enemyImpl.isBoss) {
            gameState.defeatBoss()
            bossSpawned = false
            levelComplete = true
          }
        }
      })

      // Play sound
      soundManager.playSound("explosion")

      // Vibration feedback
      if (settings.vibrationEnabled) {
        vibrate([20, 30, 50, 30, 70])
      }
    }

    // Function to pause game
    function pauseGame() {
      gameState.setState("paused")
      setShowPause(true)
      soundManager.pauseMusic()
      soundManager.playSound("menu")
    }

    // Function to resume game
    function resumeGame() {
      gameState.setState("playing")
      setShowPause(false)
      soundManager.resumeMusic()
    }

    // Function to spawn power-ups
    function spawnPowerUp() {
      if (Math.random() > currentLevel.powerUpChance) return

      const types = ["shield", "speed", "extraLife", "bomb", "timeFreeze"]
      const type = types[Math.floor(Math.random() * types.length)]

      const x = Math.floor(Math.random() * (canvas.width - 30))
      powerUps.push(new PowerUpImpl(x, -30, 30, 30, 1, type as any))
    }

    // Draw player (Bonk in a spaceship)
    function drawPlayer() {
      if (!ctx) return

      // Skip drawing if player is invulnerable and blinking
      if (player.invulnerable && Math.floor(frames / 5) % 2 === 0) {
        return
      }

      // Apply screen shake
      let shakeX = 0
      let shakeY = 0

      if (screenShake > 0) {
        shakeX = (Math.random() - 0.5) * screenShake
        shakeY = (Math.random() - 0.5) * screenShake
        screenShake *= 0.9
        if (screenShake < 0.5) screenShake = 0
      }

      // Draw shield if active
      if (player.shield > 0) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(
          player.x + player.width / 2 + shakeX,
          player.y + player.height / 2 + shakeY,
          player.width * 0.8,
          0,
          Math.PI * 2,
        )
        ctx.strokeStyle = colorPalettes.main.brightCyan
        ctx.lineWidth = 2 + Math.sin(frames * 0.1) * 1
        ctx.stroke()

        // Add glow effect
        ctx.globalAlpha = 0.2 + Math.sin(frames * 0.05) * 0.1
        ctx.fillStyle = colorPalettes.main.brightCyan
        ctx.fill()
        ctx.restore()
      }

      // Draw ship with glowing animated purple-to-blue gradient
      if (!pixelArtShip || !pixelArtShip[0]) return
      const shipPixelSize = Math.floor(player.width / pixelArtShip[0].length)

      // Create animated gradient colors
      const gradientPhase = Math.sin(frames * 0.1) * 0.5 + 0.5 // 0 to 1
      const purple = [138, 43, 226] // RGB for purple
      const blue = [0, 100, 255] // RGB for bright blue
      
      // Interpolate between purple and blue
      const r = Math.floor(purple[0] + (blue[0] - purple[0]) * gradientPhase)
      const g = Math.floor(purple[1] + (blue[1] - purple[1]) * gradientPhase)
      const b = Math.floor(purple[2] + (blue[2] - purple[2]) * gradientPhase)
      const shipColor = `rgb(${r}, ${g}, ${b})`

      // Draw constant glow border around ship
      ctx.save()
      ctx.globalAlpha = 1.0 // Full opacity
      ctx.shadowColor = shipColor
      ctx.shadowBlur = 8 + Math.sin(frames * 0.15) * 2 // Animated glow intensity
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      for (let y = 0; y < pixelArtShip.length; y++) {
        for (let x = 0; x < pixelArtShip[y].length; x++) {
          if (pixelArtShip[y][x] === 1) {
            ctx.fillStyle = shipColor
            ctx.fillRect(
              Math.floor(player.x + x * shipPixelSize + shakeX),
              Math.floor(player.y + y * shipPixelSize + shakeY),
              shipPixelSize,
              shipPixelSize,
            )
          }
        }
      }
      ctx.restore()

      // Draw Bonk (dog)
      if (!pixelArtDog || !pixelArtDog[0]) return
      const dogPixelSize = Math.floor(shipPixelSize * 0.8)
      const dogOffsetX =
        player.x + Math.floor(player.width / 2) - Math.floor((pixelArtDog[0].length * dogPixelSize) / 2)
      const dogOffsetY = player.y + Math.floor(shipPixelSize * 2)

      for (let y = 0; y < pixelArtDog.length; y++) {
        for (let x = 0; x < pixelArtDog[y].length; x++) {
          if (pixelArtDog[y][x] === 1) {
            ctx.fillStyle = colorPalettes.main.yellow
            ctx.fillRect(
              Math.floor(dogOffsetX + x * dogPixelSize + shakeX),
              Math.floor(dogOffsetY + y * dogPixelSize + shakeY),
              dogPixelSize,
              dogPixelSize,
            )
          }
        }
      }

      // Draw thrusters with animation
      if (player.isMoving && pixelArtThrusters && pixelArtThrusters[0]) {
        player.thrusterFrame += player.thrusterAnimSpeed
        const thrusterPixels = pixelArtThrusters
        const thrusterPixelSize = Math.floor(shipPixelSize * 0.8)

        // Left thruster
        for (let y = 0; y < thrusterPixels.length; y++) {
          for (let x = 0; x < thrusterPixels[y].length; x++) {
            if (thrusterPixels[y][x] === 1) {
              // Color based on direction
              let thrusterColor = colorPalettes.main.orange
              if (player.direction.x < 0) thrusterColor = colorPalettes.main.red

              ctx.fillStyle = thrusterColor
              ctx.fillRect(
                Math.floor(player.x + shipPixelSize * 2 + x * thrusterPixelSize + shakeX),
                Math.floor(player.y + player.height + y * thrusterPixelSize + shakeY),
                thrusterPixelSize,
                thrusterPixelSize,
              )
            }
          }
        }

        // Right thruster
        for (let y = 0; y < thrusterPixels.length; y++) {
          for (let x = 0; x < thrusterPixels[y].length; x++) {
            if (thrusterPixels[y][x] === 1) {
              // Color based on direction
              let thrusterColor = colorPalettes.main.orange
              if (player.direction.x > 0) thrusterColor = colorPalettes.main.red

              ctx.fillStyle = thrusterColor
              ctx.fillRect(
                Math.floor(player.x + shipPixelSize * 6 + x * thrusterPixelSize + shakeX),
                Math.floor(player.y + player.height + y * thrusterPixelSize + shakeY),
                thrusterPixelSize,
                thrusterPixelSize,
              )
            }
          }
        }

        // Update thruster animation
        player.thrusterFrame += player.thrusterAnimSpeed
      }
    }

    // Draw sun and exclamation marks
    function drawSunAndExclamation() {
      if (!ctx) return

      // Animate sun position
      sunY += Math.sin(frames * 0.02) * 0.3

      // Draw sun
      if (!pixelArtSun || !pixelArtSun[0]) return
      const sunSize = 120
      const pixelSize = Math.floor(sunSize / pixelArtSun[0].length)
      const sunX = Math.floor((canvas.width - pixelArtSun[0].length * pixelSize) / 2)

      for (let y = 0; y < pixelArtSun.length; y++) {
        for (let x = 0; x < pixelArtSun[y].length; x++) {
          if (pixelArtSun[y][x] === 1) {
            // Create gradient effect
            const distFromCenter = Math.sqrt(
              Math.pow(x - pixelArtSun[0].length / 2, 2) + Math.pow(y - pixelArtSun.length / 2, 2),
            )

            const maxDist = pixelArtSun[0].length / 2
            const colorIndex = Math.min(3, Math.floor((distFromCenter / maxDist) * 4))

            const colors = [
              colorPalettes.sun.lightYellow,
              colorPalettes.sun.yellow,
              colorPalettes.sun.orange,
              colorPalettes.sun.darkOrange,
            ]

            ctx.fillStyle = colors[colorIndex]
            ctx.fillRect(sunX + x * pixelSize, sunY + y * pixelSize, pixelSize, pixelSize)
          }
        }
      }

      // Animate exclamation marks
      exclamationTimer++
      if (exclamationTimer >= 60) {
        exclamationVisible = !exclamationVisible
        exclamationTimer = 0
      }

      // Draw exclamation marks
      if (exclamationVisible && pixelArtExclamation && pixelArtExclamation[0]) {
        const exclSize = 24
        const exclPixelSize = Math.floor(exclSize / pixelArtExclamation[0].length)
        const exclX = sunX + pixelArtSun[0].length * pixelSize - pixelArtExclamation[0].length * exclPixelSize
        const exclY = sunY

        for (let y = 0; y < pixelArtExclamation.length; y++) {
          for (let x = 0; x < pixelArtExclamation[y].length; x++) {
            if (pixelArtExclamation[y][x] === 1) {
              ctx.fillStyle = colorPalettes.main.red
              ctx.fillRect(exclX + x * exclPixelSize, exclY + y * exclPixelSize, exclPixelSize, exclPixelSize)
            }
          }
        }
      }
    }

    // Draw stars in background
    function drawBackground() {
      if (!ctx) return

      // Clear with level-specific background colors
      let backgroundColor = colorPalettes.main.space // default
      switch (currentLevel.background) {
        case "space":
          backgroundColor = colorPalettes.main.space
          break
        case "asteroids":
          backgroundColor = colorPalettes.main.asteroids
          break
        case "fleet":
          backgroundColor = colorPalettes.main.fleet
          break
        case "boss":
          backgroundColor = colorPalettes.main.boss
          break
        case "deepspace":
          backgroundColor = colorPalettes.main.deepspace
          break
        case "frontier":
          backgroundColor = colorPalettes.main.frontier
          break
        default:
          backgroundColor = colorPalettes.main.space
      }
      
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Level-specific background elements
      switch (currentLevel.background) {
        case "asteroids":
          // Draw floating asteroids
          if (frames % 180 === 0) {
            stars.push({
              x: Math.floor(Math.random() * canvas.width),
              y: -10,
              size: Math.floor(Math.random() * 8) + 4,
              color: colorPalettes.main.darkGray,
              blinkRate: 1, // Always visible
              type: "asteroid"
            })
          }
          break
        case "fleet":
          // Add distant ship silhouettes
          if (frames % 300 === 0) {
            stars.push({
              x: Math.floor(Math.random() * canvas.width),
              y: -5,
              size: Math.floor(Math.random() * 3) + 2,
              color: colorPalettes.main.darkGray,
              blinkRate: Math.floor(Math.random() * 60) + 30,
              type: "ship"
            })
          }
          break
        case "boss":
          // Pulsing energy waves
          ctx.save()
          ctx.globalAlpha = 0.1 + Math.sin(frames * 0.05) * 0.05
          ctx.fillStyle = colorPalettes.main.white
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(0, (frames * 2 + i * 80) % canvas.height, canvas.width, 2)
          }
          ctx.restore()
          break
        case "deepspace":
          // Nebula clouds
          ctx.save()
          ctx.globalAlpha = 0.05 + Math.sin(frames * 0.02) * 0.02
          ctx.fillStyle = colorPalettes.main.white
          ctx.fillRect(0, 0, canvas.width, canvas.height / 3)
          ctx.fillStyle = colorPalettes.main.lightGrey
          ctx.fillRect(0, canvas.height * 2/3, canvas.width, canvas.height / 3)
          ctx.restore()
          break
        case "frontier":
          // Energy storms
          if (Math.random() < 0.02) {
            ctx.save()
            ctx.globalAlpha = 0.3
            ctx.fillStyle = colorPalettes.main.darkGray
            const x = Math.random() * canvas.width
            const y = Math.random() * canvas.height
            ctx.fillRect(x, y, 2, canvas.height)
            ctx.restore()
          }
          break
      }

      // Draw stars with level-specific behavior
      stars.forEach((star, index) => {
        // Different behavior based on star type
        if (star.type === "asteroid") {
          // Asteroids rotate and move
          ctx.save()
          ctx.translate(star.x + star.size/2, star.y + star.size/2)
          ctx.rotate(frames * 0.02)
          ctx.fillStyle = star.color
          ctx.fillRect(-star.size/2, -star.size/2, star.size, star.size)
          ctx.restore()
          
          if (!timeFrozen) {
            star.y += 1
          }
        } else if (star.type === "ship") {
          // Distant ships blink
          if (frames % star.blinkRate < star.blinkRate / 2) {
            ctx.fillStyle = star.color
            ctx.fillRect(star.x, star.y, star.size, star.size/2)
          }
          
          if (!timeFrozen) {
            star.y += 0.5
          }
        } else {
          // Regular stars (default case)
          if (frames % star.blinkRate < star.blinkRate / 2) {
            ctx.fillStyle = star.color
            ctx.fillRect(star.x, star.y, star.size, star.size)
          }

          // Move stars for parallax effect
          if (!timeFrozen) {
            star.y += star.size / 2
          }
        }

        // Reset position when off screen
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.floor(Math.random() * canvas.width)
        }
      })

      // Draw sun and exclamation marks
      drawSunAndExclamation()

      // Add scanlines effect for retro feel
      if (frames % 2 === 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
        for (let i = 0; i < canvas.height; i += 4) {
          ctx.fillRect(0, i, canvas.width, 1)
        }
      }

      // Add time freeze overlay
      if (timeFrozen) {
        ctx.fillStyle = "rgba(200, 220, 255, 0.15)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    // Draw debug overlay for enemies (development only)
    function drawDebugOverlay() {
      if (!ctx || !settings.soundEnabled) return // Use soundEnabled as debug toggle for now
      
      // Draw enemy bounds
      enemies.forEach(enemy => {
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"
        ctx.lineWidth = 1
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height)
        
        // Draw collision area
        ctx.strokeStyle = "rgba(255, 255, 0, 0.3)"
        ctx.strokeRect(enemy.x - 5, enemy.y - 5, enemy.width + 10, enemy.height + 10)
      })
      
      // Draw player bounds
      ctx.strokeStyle = "rgba(0, 255, 0, 0.5)"
      ctx.lineWidth = 2
      ctx.strokeRect(player.x, player.y, player.width, player.height)
    }

    // Draw UI
    function drawUI() {
      if (!ctx) return

      // Score overlay
      ctx.fillStyle = colorPalettes.ui.background
      ctx.fillRect(8, 8, 150, 16)
      ctx.strokeStyle = colorPalettes.ui.border
      ctx.lineWidth = 1
      ctx.strokeRect(8, 8, 150, 16)

      ctx.fillStyle = colorPalettes.ui.text
      ctx.font = "8px 'Press Start 2P', monospace"
      ctx.textAlign = "left"
      ctx.fillText(`SCORE: ${localScore}`, 16, 18)

      // Lives
      ctx.fillStyle = colorPalettes.ui.background
      ctx.fillRect(8, 28, 80, 16)
      ctx.strokeStyle = colorPalettes.ui.border
      ctx.lineWidth = 1
      ctx.strokeRect(8, 28, 80, 16)

      ctx.fillStyle = player.lives > 1 ? colorPalettes.ui.text : colorPalettes.main.red
      ctx.font = "8px 'Press Start 2P', monospace"
      ctx.textAlign = "left"
      ctx.fillText(`LIVES: ${player.lives}`, 16, 38)

      // Level with theme name
      ctx.fillStyle = colorPalettes.ui.background
      ctx.fillRect(8, 48, 150, 16)
      ctx.strokeStyle = colorPalettes.ui.border
      ctx.lineWidth = 1
      ctx.strokeRect(8, 48, 150, 16)

      ctx.fillStyle = colorPalettes.ui.text
      ctx.font = "8px 'Press Start 2P', monospace"
      ctx.textAlign = "left"
      ctx.fillText(`${level}: ${currentLevel.name.toUpperCase()}`, 16, 58)

      // Bombs
      ctx.fillStyle = colorPalettes.ui.background
      ctx.fillRect(8, 68, 80, 16)
      ctx.strokeStyle = colorPalettes.ui.border
      ctx.lineWidth = 1
      ctx.strokeRect(8, 68, 80, 16)

      ctx.fillStyle = bombs > 0 ? colorPalettes.ui.text : colorPalettes.main.darkGray
      ctx.font = "8px 'Press Start 2P', monospace"
      ctx.textAlign = "left"
      ctx.fillText(`BOMBS: ${bombs}`, 16, 78)

      // Current weapon overlay
      ctx.fillStyle = colorPalettes.ui.background
      ctx.fillRect(canvas.width - 158, 8, 150, 16)
      ctx.strokeStyle = colorPalettes.ui.border
      ctx.lineWidth = 1
      ctx.strokeRect(canvas.width - 158, 8, 150, 16)

      ctx.fillStyle = colorPalettes.ui.text
      ctx.font = "8px 'Press Start 2P', monospace"
      ctx.textAlign = "center"
      ctx.fillText(currentWeapon.toUpperCase(), canvas.width - 83, 18)

      // Draw weapon timer if active
      if (weaponTimer > 0 && currentWeapon !== "default") {
        const timerWidth = 150 * (weaponTimer / 600)
        ctx.fillStyle = colorPalettes.ui.border
        ctx.fillRect(canvas.width - 158, 26, timerWidth, 2)
      }

      // Draw shield timer if active
      if (player.shield > 0) {
        ctx.fillStyle = colorPalettes.ui.background
        ctx.fillRect(canvas.width - 158, 32, 150, 16)
        ctx.strokeStyle = colorPalettes.main.brightCyan
        ctx.lineWidth = 1
        ctx.strokeRect(canvas.width - 158, 32, 150, 16)

        ctx.fillStyle = colorPalettes.main.brightCyan
        ctx.font = "8px 'Press Start 2P', monospace"
        ctx.textAlign = "center"
        ctx.fillText("SHIELD", canvas.width - 83, 42)

        const shieldWidth = 150 * (player.shield / 600)
        ctx.fillStyle = colorPalettes.main.brightCyan
        ctx.fillRect(canvas.width - 158, 50, shieldWidth, 2)
      }

      // Draw time freeze effect
      if (timeFrozen) {
        ctx.fillStyle = colorPalettes.ui.background
        ctx.fillRect(canvas.width - 158, 56, 150, 16)
        ctx.strokeStyle = colorPalettes.main.purple
        ctx.lineWidth = 1
        ctx.strokeRect(canvas.width - 158, 56, 150, 16)

        ctx.fillStyle = colorPalettes.main.purple
        ctx.font = "8px 'Press Start 2P', monospace"
        ctx.textAlign = "center"
        ctx.fillText("TIME FREEZE", canvas.width - 83, 66)

        const freezeWidth = 150 * (timeFreezeCounter / 180)
        ctx.fillStyle = colorPalettes.main.purple
        ctx.fillRect(canvas.width - 158, 74, freezeWidth, 2)
      }
    }

    // Draw level complete screen
    function drawLevelComplete() {
      if (!ctx) return

      // Transparent overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw level complete text
      ctx.fillStyle = colorPalettes.main.yellow
      ctx.font = "16px 'Press Start 2P', monospace"
      ctx.textAlign = "center"
      ctx.fillText("LEVEL COMPLETE!", canvas.width / 2, canvas.height / 2 - 30)

      // Draw level stats
      ctx.fillStyle = colorPalettes.main.white
      ctx.font = "8px 'Press Start 2P', monospace"
      ctx.fillText(`SCORE: ${localScore}`, canvas.width / 2, canvas.height / 2)
      ctx.fillText(`ENEMIES DEFEATED: ${enemiesDefeated}`, canvas.width / 2, canvas.height / 2 + 20)

      // Perfect level bonus
      if (perfectLevel) {
        ctx.fillStyle = colorPalettes.main.green
        ctx.fillText("PERFECT RUN BONUS: +500", canvas.width / 2, canvas.height / 2 + 40)
      }

      // Continue message (blinking)
      if (Math.floor(frames / 30) % 2 === 0) {
        ctx.fillStyle = colorPalettes.main.white
        ctx.fillText("PRESS SPACE TO CONTINUE", canvas.width / 2, canvas.height / 2 + 70)
      }
    }

    // Game loop
    function gameLoop() {
      if (!ctx || !canvas) return

      // Update current level data for this frame
      currentLevel = levels[currentLevelIndex] || levels[0]

      // Draw background
      drawBackground()

      // Check if level is complete
      if (levelComplete) {
        levelCompleteTimer++

        // Add perfect level bonus
        if (levelCompleteTimer === 1 && perfectLevel) {
          localScore += 500
          setScore(localScore) // Update React state
          gameState.addScore(500)
          gameState.recordPerfectRun()
        }

        // Continue to next level after pressing space
        if (levelCompleteTimer > 60 && keyboardManager.isKeyPressed(" ")) {
          // Check if this was the final level
          if (currentLevelIndex >= levels.length - 1) {
            // Game completed! Show victory state
            gameState.setState("victory")
            return
          }

          // Move to next level
          gameState.nextLevel()
          currentLevelIndex++
          setLevel(currentLevelIndex + 1) // Update React state to match

          // Reset level variables
          levelComplete = false
          levelCompleteTimer = 0
          currentLevelEnemies = 0
          perfectLevel = true
          bossSpawned = false

          // Play level-specific music
          soundManager.playLevelMusic(currentLevelIndex + 1)

          return
        }

        drawLevelComplete()
        gameLoopRef.current = requestAnimationFrame(gameLoop)
        return
      }

      // Handle continuous shooting
      if (isShootingPressed) {
        continuousShootingTimer++
        if (continuousShootingTimer >= continuousShootingRate && shootCooldown <= 0) {
          fireWeapon()
          continuousShootingTimer = 0
        }
      }

      // If time is frozen, update counter
      if (timeFrozen) {
        timeFreezeCounter--

        if (timeFreezeCounter <= 0) {
          timeFrozen = false
        }
      }

      // Get movement input from keyboard or mobile
      if (!isMobileDevice()) {
        player.direction = keyboardManager.getMovementDirection()
        player.isMoving = player.direction.x !== 0 || player.direction.y !== 0
      }

      // Apply physics-based movement
      if (player.direction.x !== 0) {
        // Apply acceleration
        player.velocity.x += player.direction.x * player.speed
      } else {
        // Apply friction
        player.velocity.x *= player.friction
      }

      if (player.direction.y !== 0) {
        // Apply acceleration
        player.velocity.y += player.direction.y * player.speed
      } else {
        // Apply friction
        player.velocity.y *= player.friction
      }

      // Limit maximum speed
      if (Math.abs(player.velocity.x) > player.maxSpeed) {
        player.velocity.x = Math.sign(player.velocity.x) * player.maxSpeed
      }

      if (Math.abs(player.velocity.y) > player.maxSpeed) {
        player.velocity.y = Math.sign(player.velocity.y) * player.maxSpeed
      }

      // Update player position
      player.x += player.velocity.x
      player.y += player.velocity.y

      // Keep player in bounds with bounce effect
      if (player.x < 0) {
        player.x = 0
        player.velocity.x *= -0.5 // Bounce with reduced velocity
      }

      if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width
        player.velocity.x *= -0.5 // Bounce with reduced velocity
      }

      if (player.y < 0) {
        player.y = 0
        player.velocity.y *= -0.5 // Bounce with reduced velocity
      }

      if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height
        player.velocity.y *= -0.5 // Bounce with reduced velocity
      }

      // Update shoot cooldown
      if (shootCooldown > 0) {
        shootCooldown--
      }

      // Update player invulnerability
      if (player.invulnerable) {
        player.invulnerableTimer--

        if (player.invulnerableTimer <= 0) {
          player.invulnerable = false
        }
      }

      // Update shield (only decrease if time is not frozen)
      if (player.shield > 0 && !timeFrozen) {
        player.shield--
      }

      // Draw player
      drawPlayer()

      // Check if boss level and boss not spawned
      if (currentLevel.bossLevel && !bossSpawned && currentLevelEnemies >= currentLevel.maxEnemies / 2) {
        // Level-specific boss configuration
        let bossSize = 100
        let bossHealth = 10
        let bossColor = colorPalettes.main.red
        
        if (level === 4) {
          // First boss - moderate difficulty
          bossSize = 100
          bossHealth = 15
          bossColor = colorPalettes.main.purple
        } else if (level === 6) {
          // Final boss - maximum difficulty
          bossSize = 120
          bossHealth = 25
          bossColor = colorPalettes.main.red
        }

        // Spawn boss with level-specific properties - pass health to constructor
        const boss = new BossEnemy(canvas.width / 2 - bossSize/2, -bossSize, bossSize, bossSize, bossHealth)
        boss.color = bossColor
        
        // Final boss gets special abilities
        if (level === 6) {
          boss.canTeleport = true
          boss.multiShot = true
        }
        
        enemies.push(boss)
        bosses.push(boss)
        bossSpawned = true

        // Add boss alert effect
        screenShake = 15

        // Play boss alert sound
        soundManager.playSound("boss")

        // Boss warning message
        setTimeout(() => {
          // Flash screen red for boss warning
          if (ctx) {
            ctx.save()
            ctx.globalAlpha = 0.3
            ctx.fillStyle = colorPalettes.main.red
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.restore()
          }
        }, 100)
      }

      // Spawn enemies if not at max and not a boss level with boss spawned
      if (
        frames % currentLevel.enemySpawnRate === 0 &&
        enemies.length < 10 &&
        currentLevelEnemies < currentLevel.maxEnemies &&
        !(currentLevel.bossLevel && bossSpawned)
      ) {
        // Determine enemy type based on level and special enemies setting
        let isSmall = Math.random() > 0.5
        let enemyType = "standard"
        let movementPattern = "straight"
        let canShoot = false

        // Level-specific enemy behavior
        if (currentLevel.specialEnemies) {
          // Higher levels have more variety
          const specialChance = Math.random()
          
          if (level >= 3) {
            // Level 3+: Some enemies can shoot
            canShoot = specialChance < 0.3
          }
          
          if (level >= 4) {
            // Level 4+: Different movement patterns
            if (specialChance < 0.2) {
              movementPattern = "zigzag"
            } else if (specialChance < 0.4) {
              movementPattern = "sine"
            }
          }
          
          if (level >= 5) {
            // Level 5+: Armored enemies (more health)
            if (specialChance < 0.25) {
              enemyType = "armored"
            }
          }
        }

        // Set size based on enemy type
        const width = isSmall ? 15 : (enemyType === "armored" ? 35 : 30)
        const height = isSmall ? 15 : (enemyType === "armored" ? 35 : 30)

        const x = Math.floor(Math.random() * (canvas.width - width))
        const speed = (isSmall ? 1.5 : 1) * currentLevel.enemySpeedMultiplier

        // Original enemy colors (restored)
        const colors = [
          colorPalettes.main.red,
          colorPalettes.main.green,
          colorPalettes.main.blue,
          colorPalettes.main.purple,
          colorPalettes.main.orange,
          colorPalettes.main.yellow,
          colorPalettes.main.cyan,
        ]
        const color = colors[Math.floor(Math.random() * colors.length)]

        // Create enemy with enhanced properties
        const enemy = new EnemyImpl(x, -height, width, height, speed, color, isSmall)
        
        // Set special properties
        enemy.movementPattern = movementPattern
        
        if (enemyType === "armored") {
          enemy.health = 3 // Armored enemies take 3 hits
        }
        
        if (canShoot) {
          enemy.shootTimer = Math.floor(Math.random() * 120) + 60 // Random initial delay
          enemy.projectiles = [] // Initialize projectiles array
        }

        enemies.push(enemy)
        currentLevelEnemies++
      }

      // Spawn weapon pickups
      if (frames % 300 === 0 && Math.random() > 0.3) {
        const x = Math.floor(Math.random() * (canvas.width - 30))
        const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)]
        weaponPickups.push(new WeaponPickupImpl(x, -30, 30, 30, 1, weaponType))
      }

      // Spawn power-ups
      if (frames % 500 === 0) {
        spawnPowerUp()
      }

      // Update and draw enemies (separate movement from drawing for time freeze)
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]
        
        // Always draw enemies, but only update movement/logic if time is not frozen
        if (!timeFrozen) {
          // Update enemy position and logic
          if (enemy.updateLogic && enemy.draw) {
            enemy.updateLogic()
            enemy.draw() // Always draw after updating logic
          } else {
            enemy.update() // This already includes draw()
          }

          // Check if enemy is off screen (with buffer for safety)
          if (enemy.y > canvas.height + 50 || enemy.x < -enemy.width - 50 || enemy.x > canvas.width + 50) {
            // Clean up enemy projectiles before removing
            if (enemy.projectiles) {
              enemy.projectiles.length = 0
            }
            enemies.splice(i, 1)
            continue
          }

          // Handle enemy projectiles - only if enemy is visible and on screen
          if (enemy.projectiles && enemy.x >= -enemy.width && enemy.x <= canvas.width + enemy.width && 
              enemy.y >= -enemy.height && enemy.y <= canvas.height + enemy.height) {
            for (let j = enemy.projectiles.length - 1; j >= 0; j--) {
              const projectile = enemy.projectiles[j]

              // Only check collision if projectile is visible on screen
              if (projectile.x >= -projectile.width && projectile.x <= canvas.width + projectile.width &&
                  projectile.y >= -projectile.height && projectile.y <= canvas.height + projectile.height) {
                
                // Check collision with player
                if (!player.invulnerable && checkCollision(player, projectile)) {
                  // Remove projectile
                  enemy.projectiles.splice(j, 1)

                  // Handle player damage
                  handlePlayerDamage()
                }
              } else {
                // Remove off-screen projectiles
                enemy.projectiles.splice(j, 1)
              }
            }
          }

          // Check collision with player - only if enemy is visible and on screen
          if (!player.invulnerable && 
              enemy.x >= -enemy.width && enemy.x <= canvas.width + enemy.width && 
              enemy.y >= -enemy.height && enemy.y <= canvas.height + enemy.height &&
              checkCollision(player, enemy)) {
            handlePlayerDamage()
          }

          // Check collision with projectiles
          for (let j = projectiles.length - 1; j >= 0; j--) {
            const projectile = projectiles[j]

            if (checkCollision(projectile, enemy)) {
              const enemyImpl = enemy as EnemyImpl
              const projectileImpl = projectile as ProjectileImpl
              
              // Reduce enemy health
              enemyImpl.health--

              // Create small hit effect
              for (let k = 0; k < 5; k++) {
                particles.push(
                  new ParticleImpl(
                    projectile.x + projectile.width / 2,
                    projectile.y + projectile.height / 2,
                    1,
                    projectileImpl.color,
                    {
                      x: (Math.random() - 0.5) * 2,
                      y: (Math.random() - 0.5) * 2,
                    },
                  ),
                )
              }

              // Remove projectile
              projectiles.splice(j, 1)

              // If enemy is destroyed
              if (enemyImpl.health <= 0) {
                // Create explosion
                explosions.push(
                  new ExplosionImpl(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    enemyImpl.isSmall ? 20 : enemyImpl.isBoss ? 100 : 30,
                    enemyImpl.color,
                  ),
                )

                // Add screen shake
                screenShake = enemyImpl.isSmall ? 2 : enemyImpl.isBoss ? 15 : 4

                // Create explosion particles
                for (let k = 0; k < (enemyImpl.isSmall ? 10 : enemyImpl.isBoss ? 40 : 15); k++) {
                  particles.push(
                    new ParticleImpl(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 2, enemyImpl.color, {
                      x: (Math.random() - 0.5) * 3,
                      y: (Math.random() - 0.5) * 3,
                    }),
                  )
                }

                // Remove enemy from boss array if needed
                if (enemyImpl.isBoss) {
                  const bossIndex = bosses.findIndex((b) => b === enemy)
                  if (bossIndex !== -1) {
                    bosses.splice(bossIndex, 1)
                  }
                }

                // Remove enemy
                enemies.splice(i, 1)

                // Increase score based on enemy type
                const points = enemyImpl.isSmall ? 5 : enemyImpl.isBoss ? 500 : 10
                localScore += points
                setScore(localScore) // Update React state
                gameState.addScore(points)
                enemiesDefeated++

                // Record first kill achievement
                if (enemiesDefeated === 1) {
                  gameState.recordFirstKill()
                }

                // Chance to drop power-up
                if (Math.random() < 0.1) {
                  spawnPowerUp()
                }

                // Check if boss was defeated
                if (enemyImpl.isBoss) {
                  // Boss defeated
                  gameState.defeatBoss()
                  bossSpawned = false

                  // Level complete
                  levelComplete = true

                  // Play sound
                  soundManager.playSound("levelup")
                }

                // Check if level complete (all enemies defeated)
                if (!currentLevel.bossLevel && currentLevelEnemies >= currentLevel.maxEnemies && enemies.length === 0) {
                  levelComplete = true

                  // Play sound
                  soundManager.playSound("levelup")
                }

                // Play explosion sound
                soundManager.playSound("explosion")

                // Vibration feedback
                if (settings.vibrationEnabled) {
                  vibrate(enemyImpl.isBoss ? 100 : 30)
                }

                break
              }
            }
          }
        } else {
          // When time is frozen, just draw the enemy without updating logic
          // NO COLLISION DETECTION during time freeze
          if (enemy.draw) {
            enemy.draw()
          }
        }
      }

      // Update and draw weapon pickups (separate movement from drawing for time freeze)
      for (let i = weaponPickups.length - 1; i >= 0; i--) {
        const pickup = weaponPickups[i]
        
        if (!timeFrozen) {
          // Update pickup movement and logic
          if (pickup.updateLogic && pickup.draw) {
            pickup.updateLogic()
            pickup.draw() // Always draw after updating logic
          } else {
            pickup.update() // This already includes draw()
          }

          // Check if pickup is off screen
          if (pickup.y > canvas.height) {
            weaponPickups.splice(i, 1)
            continue
          }

          // Check collision with player
          if (checkCollision(player, pickup)) {
            // Change weapon
            currentWeapon = pickup.weaponType
            weaponTimer = 600 // 10 seconds at 60fps

            // Record weapon collection for achievement
            gameState.collectWeapon(pickup.weaponType)

            // Create pickup particles
            for (let j = 0; j < 15; j++) {
              particles.push(
                new ParticleImpl(
                  pickup.x + pickup.width / 2,
                  pickup.y + pickup.height / 2,
                  2,
                  pickup.getWeaponColor(),
                  {
                    x: (Math.random() - 0.5) * 3,
                    y: (Math.random() - 0.5) * 3,
                  },
                ),
              )
            }

            // Play sound
            soundManager.playSound("powerup")

            // Vibration feedback
            if (settings.vibrationEnabled) {
              vibrate([20, 20, 20])
            }

            // Remove pickup
            weaponPickups.splice(i, 1)
          }
        } else {
          // When time is frozen, just draw the pickup without updating logic
          if (pickup.draw) {
            pickup.draw()
          }
        }
      }

      // Update and draw power-ups (separate movement from drawing for time freeze)
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i]
        
        if (!timeFrozen) {
          // Update power-up movement and logic
          if (powerUp.updateLogic && powerUp.draw) {
            powerUp.updateLogic()
            powerUp.draw() // Always draw after updating logic
          } else {
            powerUp.update() // This already includes draw()
          }

          // Check if power-up is off screen
          if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1)
            continue
          }

          // Check collision with player
          if (checkCollision(player, powerUp)) {
            // Apply power-up effect
            applyPowerUp(powerUp)

            // Create pickup particles
            for (let j = 0; j < 15; j++) {
              particles.push(
                new ParticleImpl(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, 2, powerUp.getColor(), {
                  x: (Math.random() - 0.5) * 3,
                  y: (Math.random() - 0.5) * 3,
                }),
              )
            }

            // Play sound
            soundManager.playSound("powerup")

            // Vibration feedback
            if (settings.vibrationEnabled) {
              vibrate([20, 20, 20])
            }

            // Remove power-up
            powerUps.splice(i, 1)
          }
        } else {
          // When time is frozen, just draw the power-up without updating logic
          if (powerUp.draw) {
            powerUp.draw()
          }
        }
      }

      // Update weapon timer (only decrease if time is not frozen)
      if (weaponTimer > 0 && !timeFrozen) {
        weaponTimer--
        if (weaponTimer === 0) {
          currentWeapon = "default"
        }
      }

      // Update and draw projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i]
        projectile.update()

        // Remove projectile if off screen
        if (
          projectile.y + projectile.height < 0 ||
          projectile.y > canvas.height ||
          projectile.x < 0 ||
          projectile.x > canvas.width
        ) {
          projectiles.splice(i, 1)
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]

        if (particle.alpha <= 0) {
          particles.splice(i, 1)
        } else {
          particle.update()
        }
      }

      // Update and draw explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i]

        if (!explosion.update()) {
          explosions.splice(i, 1)
        }
      }

      // Check level completion outside of enemy destruction loop
      if (!levelComplete && !currentLevel.bossLevel && currentLevelEnemies >= currentLevel.maxEnemies && enemies.length === 0) {
        levelComplete = true
        // Play sound
        soundManager.playSound("levelup")
      }

      // Draw UI
      drawUI()

      // Draw debug overlay (only when sound is disabled - for development)
      // drawDebugOverlay()

      // Increment frame counter
      frames++

      // Request next frame
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    // Handle player damage
    function handlePlayerDamage() {
      // Check if player has shield
      if (player.shield > 0) {
        // Reduce shield instead of taking damage
        player.shield = 0

        // Create shield break effect
        for (let i = 0; i < 20; i++) {
          particles.push(
            new ParticleImpl(player.x + player.width / 2, player.y + player.height / 2, 2, colorPalettes.main.brightCyan, {
              x: (Math.random() - 0.5) * 4,
              y: (Math.random() - 0.5) * 4,
            }),
          )
        }

        // Add screen shake
        screenShake = 5

        // Play shield sound
        soundManager.playSound("shield")

        // Set brief invulnerability
        player.invulnerable = true
        player.invulnerableTimer = 60

        return
      }

      // Create explosion
      explosions.push(
        new ExplosionImpl(player.x + player.width / 2, player.y + player.height / 2, 40, colorPalettes.main.yellow),
      )

      // Add screen shake
      screenShake = 10

      // Create explosion particles
      for (let i = 0; i < 30; i++) {
        particles.push(
          new ParticleImpl(
            player.x + player.width / 2,
            player.y + player.height / 2,
            2,
            i % 2 === 0 ? colorPalettes.main.white : colorPalettes.main.yellow,
            {
              x: (Math.random() - 0.5) * 4,
              y: (Math.random() - 0.5) * 4,
            },
          ),
        )
      }

      // Reduce lives
      player.lives--

      // Mark level as not perfect
      perfectLevel = false

      // Check if game over
      if (player.lives <= 0) {
        // Game over
        gameState.setState("gameOver")

        // Check for high score
        if (gameState.isHighScore()) {
          setShowNewHighScore(true)
        }

        // Play sound
        soundManager.playSound("gameover")

        // Vibration feedback
        if (settings.vibrationEnabled) {
          vibrate([100, 50, 100, 50, 100])
        }

        return
      }

      // Set invulnerability
      player.invulnerable = true
      player.invulnerableTimer = 120

      // Play damage sound
      soundManager.playSound("damage")

      // Vibration feedback
      if (settings.vibrationEnabled) {
        vibrate([50, 30, 50])
      }
    }

    // Apply power-up effects
    function applyPowerUp(powerUp: PowerUp) {
      switch (powerUp.type) {
        case "shield":
          player.shield = powerUp.duration
          soundManager.playSound("shield")
          break

        case "speed":
          // Increase speed temporarily
          const originalSpeed = player.speed
          const originalMaxSpeed = player.maxSpeed

          player.speed *= 1.5
          player.maxSpeed *= 1.5

          // Store the speed boost state for UI display
          let speedBoostActive = true
          let speedBoostTimer = powerUp.duration

          // Create a timer function that decrements each frame
          const speedBoostCountdown = () => {
            if (speedBoostActive && speedBoostTimer > 0) {
              speedBoostTimer--
              if (speedBoostTimer <= 0) {
                // Reset speed
                player.speed = originalSpeed
                player.maxSpeed = originalMaxSpeed
                speedBoostActive = false
              } else {
                // Continue countdown next frame
                requestAnimationFrame(speedBoostCountdown)
              }
            }
          }

          // Start the countdown
          requestAnimationFrame(speedBoostCountdown)
          break

        case "extraLife":
          player.lives = Math.min(player.lives + 1, 5)
          break

        case "bomb":
          bombs = Math.min(bombs + 1, 3)
          break

        case "timeFreeze":
          timeFrozen = true
          timeFreezeCounter = powerUp.duration
          break
      }
    }

    useBombFnRef.current = useBomb

    // Start game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop)

    // Cleanup
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
      keyboardManager.cleanup()
      mobileControlsManager.hide()
      window.removeEventListener("keyup", handleKeyUp)

      // Remove mobile-specific event listeners and styles
      if (isMobileDevice()) {
        window.removeEventListener("orientationchange", handleCanvasResize)
        canvas.removeEventListener("touchstart", handleTouchStart)
        document.body.style.overflow = ""
        document.body.style.touchAction = ""
      }
    }
  }, [currentGameState, level, lives, settings])

  // Handle window resize for responsive canvas
  useEffect(() => {
    if (!canvasRef.current) return

    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      // Maintain aspect ratio while fitting the screen
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      const aspectRatio = 320 / 240

      // Calculate new dimensions
      let newWidth, newHeight
      if (containerWidth / containerHeight > aspectRatio) {
        // Container is wider than needed
        newHeight = containerHeight
        newWidth = newHeight * aspectRatio
      } else {
        // Container is taller than needed
        newWidth = containerWidth
        newHeight = newWidth / aspectRatio
      }

      // Apply new dimensions to canvas style
      canvas.style.width = `${newWidth}px`
      canvas.style.height = `${newHeight}px`
    }

    // Initial sizing
    handleResize()

    // Add resize listener
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [canvasRef.current])

  // Draw title screen
  useEffect(() => {
    if (currentGameState !== "title" || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Animation loop for title screen
    let animationId: number
    const frames = 0

    function animateTitleScreen() {
      if (!ctx) return
      
      // Enable pixel art rendering
      ctx.imageSmoothingEnabled = false

      // Draw background
      ctx.fillStyle = colorPalettes.main.darkBlue
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      for (let i = 0; i < 100; i++) {
        if ((i + frames) % 120 < 60) {
          ctx.fillStyle = i % 2 === 0 ? colorPalettes.main.white : colorPalettes.main.lightGray
          ctx.fillRect(
            Math.floor(Math.random() * canvas.width),
            Math.floor(Math.random() * canvas.height),
            Math.random() > 0.8 ? 2 : 1,
            Math.random() > 0.8 ? 2 : 1,
          )
        }
      }

      // Draw sun - animated
      if (pixelArtSun && pixelArtSun[0]) {
        const sunSize = 80
        const pixelSize = Math.floor(sunSize / pixelArtSun[0].length)
        const sunX = Math.floor((canvas.width - pixelArtSun[0].length * pixelSize) / 2)
        const sunY = Math.floor(canvas.height / 2) + Math.sin(frames * 0.05) * 5

        for (let y = 0; y < pixelArtSun.length; y++) {
          for (let x = 0; x < pixelArtSun[y].length; x++) {
            if (pixelArtSun[y][x] === 1) {
              // Create gradient effect
              const distFromCenter = Math.sqrt(
                Math.pow(x - pixelArtSun[0].length / 2, 2) + Math.pow(y - pixelArtSun.length / 2, 2),
              )

              const maxDist = pixelArtSun[0].length / 2
              const colorIndex = Math.min(3, Math.floor((distFromCenter / maxDist) * 4))

              const colors = [
                colorPalettes.sun.lightYellow,
                colorPalettes.sun.yellow,
                colorPalettes.sun.orange,
                colorPalettes.sun.darkOrange,
              ]

              ctx.fillStyle = colors[colorIndex]
              ctx.fillRect(sunX + x * pixelSize, sunY + y * pixelSize, pixelSize, pixelSize)
            }
          }
        }
      }

      // Draw title text with animation - UPDATED GAME NAME
      ctx.fillStyle = colorPalettes.main.yellow
      ctx.font = "24px 'Press Start 2P', monospace"
      ctx.textAlign = "center"
      ctx.fillText("S.S.I.", canvas.width / 2, 80 + Math.sin(frames * 0.1) * 3)

      // Draw subtitle
      ctx.fillStyle = colorPalettes.main.orange
      ctx.font = "8px 'Press Start 2P', monospace"
      ctx.fillText("SOL SPACE INVADERS", canvas.width / 2, 100)

      // Draw blinking "Press Start" text
      if (Math.floor(frames / 30) % 2 === 0) {
        ctx.fillStyle = colorPalettes.main.white
        ctx.font = "12px 'Press Start 2P', monospace"
        ctx.fillText("PRESS START", canvas.width / 2, canvas.height - 50)
      }

      // Draw dog (animated)
      if (pixelArtDog && pixelArtDog[0]) {
        const dogSize = 30
        const dogPixelSize = Math.floor(dogSize / pixelArtDog[0].length)
        const dogX = Math.floor(canvas.width / 2 - (pixelArtDog[0].length * dogPixelSize) / 2)
        const dogY = Math.floor(canvas.height - 120 + Math.sin(frames * 0.1) * 3)

        for (let y = 0; y < pixelArtDog.length; y++) {
          for (let x = 0; x < pixelArtDog[y].length; x++) {
            if (pixelArtDog[y][x] === 1) {
              ctx.fillStyle = colorPalettes.main.yellow
              ctx.fillRect(dogX + x * dogPixelSize, dogY + y * dogPixelSize, dogPixelSize, dogPixelSize)
            }
          }
        }
      }

      // Add scanlines effect for retro feel
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      for (let i = 0; i < canvas.height; i += 2) {
        ctx.fillRect(0, i, canvas.width, 1)
      }

      // Continue animation
      animationId = requestAnimationFrame(animateTitleScreen)
    }

    // Start animation
    animationId = requestAnimationFrame(animateTitleScreen)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [currentGameState])

  // Handle start game
  const startGame = () => {
    // Reset game state
    gameState.resetGame()
    setLives(3)

    // Play sound
    soundManager.playSound("menu")
    soundManager.playLevelMusic(1)
  }

  // Handle resume game
  const resumeGame = () => {
    gameState.setState("playing")
    setShowPause(false)
    soundManager.resumeMusic()
  }

  // Handle settings toggle
  const toggleSettings = () => {
    setShowSettings(!showSettings)
    soundManager.playSound("menu")
  }

  // Handle high scores toggle
  const toggleHighScores = () => {
    setShowHighScores(!showHighScores)
    soundManager.playSound("menu")
  }

  // Handle achievements toggle
  const toggleAchievements = () => {
    setShowAchievements(!showAchievements)
    soundManager.playSound("menu")
  }

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Handle high score submission
  const submitHighScore = () => {
    if (playerName.trim()) {
      gameState.addHighScore(playerName)
      setShowNewHighScore(false)
      setShowHighScores(true)
    }
  }

  // Render settings panel
  const renderSettings = () => {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-10 p-4">
        <div
          className={`bg-gray-900 border-2 border-yellow-500 p-4 ${isMobileDevice() ? "w-full" : "max-w-md w-full"}`}
        >
          <h2 className="text-xl text-yellow-400 font-bold mb-4 font-mono">SETTINGS</h2>

          <div className="space-y-4">
            {/* Sound Effects */}
            <div className="flex justify-between items-center">
              <span className="text-white font-mono">SOUND EFFECTS</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>

            {/* Sound Volume */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-white font-mono">SOUND VOLUME</span>
                <span className="text-white font-mono">{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.soundVolume}
                onChange={(e) => setSettings({ ...settings, soundVolume: Number.parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Music */}
            <div className="flex justify-between items-center">
              <span className="text-white font-mono">MUSIC</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.musicEnabled}
                  onChange={() => setSettings({ ...settings, musicEnabled: !settings.musicEnabled })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>

            {/* Music Volume */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-white font-mono">MUSIC VOLUME</span>
                <span className="text-white font-mono">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.musicVolume}
                onChange={(e) => setSettings({ ...settings, musicVolume: Number.parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <span className="text-white font-mono">DIFFICULTY</span>
              <div className="flex space-x-2">
                {["easy", "normal", "hard"].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSettings({ ...settings, difficulty: diff as any })}
                    className={`px-3 py-1 font-mono uppercase ${
                      settings.difficulty === diff ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Vibration - Only show on mobile */}
            {isMobileDevice() && (
              <div className="flex justify-between items-center">
                <span className="text-white font-mono">VIBRATION</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.vibrationEnabled}
                    onChange={() => setSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            )}

            {/* Fullscreen */}
            <div className="flex justify-between items-center">
              <span className="text-white font-mono">FULLSCREEN</span>
              <button onClick={toggleFullscreen} className="px-3 py-1 bg-gray-700 text-white font-mono">
                {isFullScreen ? "EXIT" : "ENTER"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={toggleSettings} className="px-4 py-2 bg-yellow-500 text-black font-bold font-mono">
              CLOSE
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render high scores panel
  const renderHighScores = () => {
    const highScores = gameState.getHighScores()

    return (
      <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-10">
        <div className="bg-gray-900 border-2 border-yellow-500 p-4 max-w-md w-full">
          <h2 className="text-xl text-yellow-400 font-bold mb-4 font-mono">HIGH SCORES</h2>

          {highScores.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {highScores.map((score, index) => (
                <div key={index} className="flex justify-between items-center border-b border-gray-700 pb-1">
                  <div className="flex items-center">
                    <span className="text-yellow-400 font-mono w-8">{index + 1}.</span>
                    <span className="text-white font-mono">{score.name}</span>
                  </div>
                  <span className="text-white font-mono">{score.score}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white font-mono text-center py-8">NO HIGH SCORES YET</div>
          )}

          <div className="mt-6 flex justify-end">
            <button onClick={toggleHighScores} className="px-4 py-2 bg-yellow-500 text-black font-bold font-mono">
              CLOSE
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render achievements panel
  const renderAchievements = () => {
    const achievements = gameState.getAchievements()

    return (
      <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-10">
        <div className="bg-gray-900 border-2 border-yellow-500 p-4 max-w-md w-full">
          <h2 className="text-xl text-yellow-400 font-bold mb-4 font-mono">ACHIEVEMENTS</h2>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-2 border ${
                  achievement.unlocked ? "border-yellow-500 bg-gray-800" : "border-gray-700 bg-gray-900"
                }`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center mr-2">
                    {achievement.unlocked ? (
                      <span className="text-yellow-400 text-xl">★</span>
                    ) : (
                      <span className="text-gray-600 text-xl">☆</span>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-mono ${achievement.unlocked ? "text-yellow-400" : "text-gray-400"}`}>
                      {achievement.secret && !achievement.unlocked ? "???" : achievement.name}
                    </h3>
                    <p className={`text-xs font-mono ${achievement.unlocked ? "text-white" : "text-gray-500"}`}>
                      {achievement.secret && !achievement.unlocked ? "Secret achievement" : achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={toggleAchievements} className="px-4 py-2 bg-yellow-500 text-black font-bold font-mono">
              CLOSE
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render new high score form
  const renderNewHighScore = () => {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-10">
        <div className="bg-gray-900 border-2 border-yellow-500 p-4 max-w-md w-full">
          <h2 className="text-xl text-yellow-400 font-bold mb-2 font-mono">NEW HIGH SCORE!</h2>
          <p className="text-white font-mono mb-4">Your score: {score}</p>

          <div className="mb-4">
            <label className="block text-white font-mono mb-2">ENTER YOUR NAME:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={10}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white font-mono focus:border-yellow-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={submitHighScore}
              disabled={!playerName.trim()}
              className={`px-4 py-2 font-bold font-mono ${
                playerName.trim() ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-400"
              }`}
            >
              SUBMIT
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render pause menu
  const renderPauseMenu = () => {
    return (
      <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10">
        <div className="bg-gray-900 border-2 border-yellow-500 p-4 max-w-md w-full">
          <h2 className="text-xl text-yellow-400 font-bold mb-6 font-mono text-center">GAME PAUSED</h2>

          <div className="space-y-3">
            <button onClick={resumeGame} className="w-full py-2 bg-yellow-500 text-black font-bold font-mono">
              RESUME GAME
            </button>

            <button onClick={toggleSettings} className="w-full py-2 bg-gray-700 text-white font-mono">
              SETTINGS
            </button>

            <button
              onClick={() => {
                setShowPause(false)
                gameState.setState("title")
              }}
              className="w-full py-2 bg-blue-600 text-white font-mono hover:bg-blue-500 transition-colors"
            >
              🏠 MAIN MENU
            </button>

            <button
              onClick={() => window.location.href = "/"}
              className="w-full py-2 bg-green-600 text-white font-mono hover:bg-green-500 transition-colors"
            >
              🌟 HOME PAGE
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render achievement notification
  const renderAchievementNotification = () => {
    if (!achievementNotification) return null

    return (
      <div className="absolute top-4 right-4 bg-yellow-500 text-black p-2 font-mono animate-bounce z-20">
        <div className="flex items-center">
          <span className="mr-2">★</span>
          <div>
            <p className="font-bold">Achievement Unlocked!</p>
            <p>{achievementNotification}</p>
          </div>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-2 max-h-screen overflow-hidden relative">
      {/* Game Canvas */}
      <div className="relative border-2 border-yellow-500 overflow-hidden" id="game-container">
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className={`pixelated ${isMobileDevice() ? "w-full h-auto max-w-full" : "w-[640px] h-[480px]"}`}
          onClick={() => {
            if (currentGameState === "title") {
              startGame()
            }
          }}
        />
      </div>

      {/* Title Screen UI */}
      {currentGameState === "title" && (
        <div
          className={`absolute bottom-4 ${isMobileDevice() ? "flex flex-col space-y-2 w-full px-4" : "flex space-x-2"}`}
        >
          <button onClick={startGame} className="px-4 py-2 bg-yellow-500 text-black font-bold font-mono">
            START GAME
          </button>

          <button onClick={toggleHighScores} className="px-4 py-2 bg-gray-700 text-white font-mono">
            HIGH SCORES
          </button>

          <button onClick={toggleAchievements} className="px-4 py-2 bg-gray-700 text-white font-mono">
            ACHIEVEMENTS
          </button>

          <button onClick={toggleSettings} className="px-4 py-2 bg-gray-700 text-white font-mono">
            SETTINGS
          </button>
        </div>
      )}

      {/* Victory Screen */}
      {currentGameState === "victory" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-90 p-6 text-center max-w-2xl mx-4">
            <h2 className="text-yellow-500 text-3xl font-bold mb-4 font-mono">CONGRATULATIONS!</h2>
            <p className="text-white font-mono mb-4 text-lg">You've completed all 6 levels!</p>
            <p className="text-white font-mono mb-4">FINAL SCORE: {score}</p>
            <p className="text-white font-mono mb-6">HIGH SCORE: {highScore}</p>
            
            <div className="bg-yellow-500 text-black p-4 rounded mb-6">
              <p className="font-mono font-bold mb-2">🏆 TRAINING COMPLETE! 🏆</p>
              <p className="font-mono text-sm mb-2">
                You now qualify to enter the competition to earn up to 100 SOL in our SOL Invaders Competition.
              </p>
              <p className="font-mono text-sm mb-4">
                Follow{" "}
                <a
                  href="https://x.com/solinvadersxyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-800 underline font-bold hover:text-blue-600"
                >
                  @SOLinvadersXYZ
                </a>{" "}
                on X.
              </p>
              <p className="font-mono text-sm">
                Come back for the SOL Invaders Olympics activities starting tonight at midnight CST and goes on to infinity and beyond!
              </p>
            </div>

            {/* Add share button */}
            <div className="mb-6">
              <ScoreShare score={score} level={level} buttonText="SHARE VICTORY" />
            </div>

            <div className={`${isMobileDevice() ? "flex flex-col space-y-3" : "flex flex-wrap gap-3 justify-center"}`}>
              <button onClick={startGame} className="px-6 py-3 bg-yellow-500 text-black font-bold font-mono rounded hover:bg-yellow-400 transition-colors">
                🎮 PLAY AGAIN
              </button>

              <button
                onClick={() => gameState.setState("title")}
                className="px-6 py-3 bg-blue-600 text-white font-mono rounded hover:bg-blue-500 transition-colors"
              >
                🏠 MAIN MENU
              </button>

              <button
                onClick={() => window.location.href = "/"}
                className="px-6 py-3 bg-green-600 text-white font-mono rounded hover:bg-green-500 transition-colors"
              >
                🌟 HOME PAGE
              </button>

              <button
                onClick={toggleHighScores}
                className="px-6 py-3 bg-purple-600 text-white font-mono rounded hover:bg-purple-500 transition-colors"
              >
                🏆 HIGH SCORES
              </button>

              <button
                onClick={toggleAchievements}
                className="px-6 py-3 bg-orange-600 text-white font-mono rounded hover:bg-orange-500 transition-colors"
              >
                ⭐ ACHIEVEMENTS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {currentGameState === "gameOver" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-70 p-6 text-center">
            <h2 className="text-red-500 text-3xl font-bold mb-4 font-mono">GAME OVER</h2>
            <p className="text-white font-mono mb-2">SCORE: {score}</p>
            <p className="text-white font-mono mb-6">HIGH SCORE: {highScore}</p>

            {challengeId && challengeData && (
              <div className="mb-4 text-center">
                <p className="text-yellow-400 font-mono mb-2">Challenge from {challengeData.challengerUsername}</p>
                <p className="text-white font-mono mb-2">Score to beat: {challengeData.score}</p>
                {score > challengeData.score ? (
                  <p className="text-green-400 font-mono">You beat the challenge!</p>
                ) : (
                  <p className="text-red-400 font-mono">You didn't beat the challenge.</p>
                )}
                <button
                  onClick={async () => {
                    // if (!authenticated || !user) return

                    try {
                      // const accessToken = await getAccessToken()
                      const accessToken = "test"

                      await fetch("/api/challenges", {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({
                          challengeId,
                          status: "completed",
                          score,
                          level,
                        }),
                      })

                      // Redirect to challenges page
                      window.location.href = "/challenges"
                    } catch (error) {
                      console.error("Error completing challenge:", error)
                    }
                  }}
                  className="px-4 py-2 mt-2 bg-yellow-500 text-black font-bold font-mono rounded-md hover:bg-yellow-400 transition-colors"
                >
                  SUBMIT CHALLENGE RESULT
                </button>
              </div>
            )}

            {/* Add share button */}
            <div className="mb-4">
              <ScoreShare score={score} level={level} buttonText="SHARE SCORE" />
            </div>

            <div className={`${isMobileDevice() ? "flex flex-col space-y-3" : "flex flex-wrap gap-3 justify-center"}`}>
              <button onClick={startGame} className="px-6 py-3 bg-yellow-500 text-black font-bold font-mono rounded hover:bg-yellow-400 transition-colors">
                🎮 PLAY AGAIN
              </button>

              <button
                onClick={() => gameState.setState("title")}
                className="px-6 py-3 bg-blue-600 text-white font-mono rounded hover:bg-blue-500 transition-colors"
              >
                🏠 MAIN MENU
              </button>

              <button
                onClick={() => window.location.href = "/"}
                className="px-6 py-3 bg-green-600 text-white font-mono rounded hover:bg-green-500 transition-colors"
              >
                🌟 HOME PAGE
              </button>

              <button
                onClick={toggleHighScores}
                className="px-6 py-3 bg-purple-600 text-white font-mono rounded hover:bg-purple-500 transition-colors"
              >
                🏆 HIGH SCORES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Controls Info */}
      {isMobileDevice() && currentGameState === "playing" && (
        <div className="mt-2 text-yellow-400 text-xs font-mono pixelated text-center">
          USE JOYSTICK TO MOVE | TAP FIRE BUTTON TO SHOOT | TAP BOMB BUTTON FOR BOMB
        </div>
      )}

      {/* Desktop Controls Info */}
      {!isMobileDevice() && currentGameState === "playing" && (
        <div className="mt-2 text-yellow-400 text-xs font-mono pixelated text-center">
          WASD/ARROWS TO MOVE | SPACE TO SHOOT | B FOR BOMB | P TO PAUSE
        </div>
      )}

      {/* Modals - Make them more mobile-friendly */}
      {showSettings && renderSettings()}
      {showHighScores && renderHighScores()}
      {showAchievements && renderAchievements()}
      {showNewHighScore && renderNewHighScore()}
      {showPause && renderPauseMenu()}

      {/* Achievement Notification */}
      {renderAchievementNotification()}
    </div>
  )
}
