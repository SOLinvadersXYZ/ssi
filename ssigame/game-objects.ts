import {
  pixelArtEnemies,
  pixelArtEnemiesSmall,
  pixelArtExplosion,
  pixelArtProjectiles,
  pixelArtWeapons,
  colorPalettes,
} from "./pixel-art"
import type { Enemy, Explosion, Particle, PowerUp, PowerUpType, Projectile, WeaponPickup } from "./types"

// Enemy class implementation
export class EnemyImpl implements Enemy {
  x: number
  y: number
  width: number
  height: number
  speed: number
  color: string
  type: string
  typeIndex: number
  isSmall: boolean
  frame = 0
  animationSpeed = 0.05
  movementPattern: string
  movementOffset = 0
  health: number
  isBoss = false
  shootTimer?: number
  projectiles?: Projectile[]

  constructor(x: number, y: number, width: number, height: number, speed: number, color: string, isSmall = false) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.speed = speed
    this.color = color
    this.isSmall = isSmall

    // Select appropriate enemy type
    this.typeIndex = isSmall 
      ? Math.floor(Math.random() * pixelArtEnemiesSmall.length)
      : Math.floor(Math.random() * pixelArtEnemies.length)
    this.type = isSmall ? `small_${this.typeIndex}` : `type_${this.typeIndex}`

    // Set movement pattern
    const patterns = ["straight", "zigzag", "sine"]
    this.movementPattern = patterns[Math.floor(Math.random() * patterns.length)]

    // Set health based on size
    this.health = isSmall ? 1 : 2

    // Initialize projectiles array for shooting enemies
    this.projectiles = []

    // Initialize shoot timer for enemies that can shoot
    if (Math.random() > 0.7 && !isSmall) {
      this.shootTimer = Math.floor(Math.random() * 100) + 60
    }
  }

  draw() {
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Select appropriate pixel art based on size and type index
    const pixelArray = this.isSmall ? pixelArtEnemiesSmall : pixelArtEnemies
    const pixels = pixelArray[this.typeIndex] || pixelArray[0] // Fallback to first type
    if (!pixels || !pixels[0]) return

    const pixelSize = Math.floor(this.width / pixels[0].length)

    // Draw enemy
    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        if (pixels[y][x] === 1) {
          // Alternate colors for animation
          const frameOffset = Math.floor(this.frame) % 2
          ctx.fillStyle = frameOffset === 0 ? this.color : this.getAlternateColor()

          ctx.fillRect(this.x + x * pixelSize, this.y + y * pixelSize, pixelSize, pixelSize)
        }
      }
    }

    // Update animation frame
    this.frame += this.animationSpeed
  }

  getAlternateColor() {
    // Return a slightly different color for animation
    switch (this.color) {
      case colorPalettes.main.red:
        return colorPalettes.main.orange
      case colorPalettes.main.green:
        return colorPalettes.main.lightGreen
      case colorPalettes.main.blue:
        return colorPalettes.main.lightBlue
      case colorPalettes.main.purple:
        return colorPalettes.main.darkPurple
      default:
        return colorPalettes.main.lightGray
    }
  }

  update() {
    // Basic vertical movement
    this.y += this.speed

    // Apply movement pattern
    this.movementOffset += 0.05

    if (this.movementPattern === "zigzag") {
      this.x += Math.sin(this.movementOffset) * 2
    } else if (this.movementPattern === "sine") {
      this.x += Math.sin(this.movementOffset) * 1
    }

    // Handle shooting if this enemy can shoot
    if (this.shootTimer !== undefined) {
      this.shootTimer--

      if (this.shootTimer <= 0) {
        // Reset timer
        this.shootTimer = Math.floor(Math.random() * 100) + 60

        // Create enemy projectile
        if (this.projectiles) {
          const projectile = new ProjectileImpl(
            this.x + this.width / 2,
            this.y + this.height,
            6,
            8,
            this.color,
            "default",
          )
          projectile.isEnemyProjectile = true
          projectile.speed = -3 // Negative speed to move downward

          this.projectiles.push(projectile)
        }
      }
    }

    // Update projectiles
    if (this.projectiles) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const projectile = this.projectiles[i]
        projectile.update()

        // Remove off-screen projectiles (more comprehensive bounds checking)
        const canvas = document.querySelector("canvas")
        if (canvas && (
          projectile.y > canvas.height + 50 || 
          projectile.y < -50 || 
          projectile.x < -50 || 
          projectile.x > canvas.width + 50
        )) {
          this.projectiles.splice(i, 1)
        }
      }
    }

    this.draw()
  }

  // Separate update logic method (movement and AI without drawing)
  updateLogic() {
    // Basic vertical movement
    this.y += this.speed

    // Apply movement pattern
    this.movementOffset += 0.05

    if (this.movementPattern === "zigzag") {
      this.x += Math.sin(this.movementOffset) * 2
    } else if (this.movementPattern === "sine") {
      this.x += Math.sin(this.movementOffset) * 1
    }

    // Handle shooting if this enemy can shoot
    if (this.shootTimer !== undefined) {
      this.shootTimer--

      if (this.shootTimer <= 0) {
        // Reset timer
        this.shootTimer = Math.floor(Math.random() * 100) + 60

        // Create enemy projectile
        if (this.projectiles) {
          const projectile = new ProjectileImpl(
            this.x + this.width / 2,
            this.y + this.height,
            6,
            8,
            this.color,
            "default",
          )
          projectile.isEnemyProjectile = true
          projectile.speed = -3 // Negative speed to move downward

          this.projectiles.push(projectile)
        }
      }
    }

    // Update projectiles
    if (this.projectiles) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const projectile = this.projectiles[i]
        
        if (projectile.updateLogic) {
          projectile.updateLogic()
        } else {
          // Fallback to regular update if updateLogic doesn't exist
          projectile.update()
        }

        // Remove off-screen projectiles (more comprehensive bounds checking)
        const canvas = document.querySelector("canvas")
        if (canvas && (
          projectile.y > canvas.height + 50 || 
          projectile.y < -50 || 
          projectile.x < -50 || 
          projectile.x > canvas.width + 50
        )) {
          this.projectiles.splice(i, 1)
        }
      }
    }
  }
}

// Boss enemy class extends Enemy
export class BossEnemy extends EnemyImpl {
  attackPattern = 0
  attackTimer = 0
  phaseTimer = 0
  currentPhase = 0
  maxPhases = 3
  canTeleport = false
  multiShot = false
  maxHealth: number // Store original max health for health bar calculation

  constructor(x: number, y: number, width: number, height: number, health = 30) {
    super(x, y, width, height, 0.5, colorPalettes.main.red)
    this.health = health
    this.maxHealth = health // Store for health bar calculations
    this.isBoss = true
    this.shootTimer = 30
    this.movementPattern = "sine"
    this.projectiles = [] // Initialize projectiles array for boss
    // Boss always uses type_0 (first enemy type) for its sprite
    this.typeIndex = 0
    this.type = "type_0"
  }

  update() {
    // Boss doesn't use standard enemy movement
    this.movementOffset += 0.02

    // Phase-based behavior
    this.phaseTimer++
    if (this.phaseTimer > 600) {
      // Change phase every 10 seconds
      this.phaseTimer = 0
      this.currentPhase = (this.currentPhase + 1) % this.maxPhases
    }

    // Different movement based on phase
    switch (this.currentPhase) {
      case 0: // Side-to-side movement
        this.x = 160 + Math.sin(this.movementOffset) * 120
        this.y = 80 + Math.sin(this.movementOffset * 0.5) * 20
        break
      case 1: // Circle pattern
        this.x = 160 + Math.cos(this.movementOffset) * 80
        this.y = 100 + Math.sin(this.movementOffset) * 40
        break
      case 2: // Aggressive forward and back
        this.x = 160 + Math.sin(this.movementOffset * 2) * 100
        this.y = 80 + Math.abs(Math.sin(this.movementOffset * 0.5)) * 60
        break
    }

    // Teleport ability for final boss
    if (this.canTeleport && Math.random() < 0.01) {
      // Random teleport
      this.x = Math.random() * (320 - this.width)
      this.y = 50 + Math.random() * 100
    }

    // Attack patterns
    this.attackTimer++

    const attackSpeed = this.multiShot ? 20 : 30 // Final boss attacks faster
    if (this.attackTimer > attackSpeed) {
      this.attackTimer = 0
      this.attackPattern = (this.attackPattern + 1) % (this.multiShot ? 5 : 4)

      // Create projectiles based on attack pattern
      if (this.projectiles) {
        switch (this.attackPattern) {
          case 0: // Single powerful shot
            const projectile = new ProjectileImpl(
              this.x + this.width / 2,
              this.y + this.height,
              8,
              12,
              colorPalettes.main.red,
              "default",
            )
            projectile.isEnemyProjectile = true
            projectile.speed = -5
            projectile.damage = 2
            this.projectiles.push(projectile)
            break

          case 1: // Spread shot
            for (let i = -2; i <= 2; i++) {
              const spreadProjectile = new ProjectileImpl(
                this.x + this.width / 2,
                this.y + this.height,
                6,
                8,
                colorPalettes.main.orange,
                "spread",
                i,
              )
              spreadProjectile.isEnemyProjectile = true
              spreadProjectile.speed = -4
              spreadProjectile.damage = 1
              this.projectiles.push(spreadProjectile)
            }
            break

          case 2: // Circle shot
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2
              const circleProjectile = new ProjectileImpl(
                this.x + this.width / 2,
                this.y + this.height / 2,
                5,
                5,
                colorPalettes.main.purple,
                "plasma",
              )
              circleProjectile.isEnemyProjectile = true
              circleProjectile.speed = 3
              circleProjectile.dx = Math.cos(angle) * 3
              circleProjectile.speed = -Math.sin(angle) * 3
              circleProjectile.damage = 1
              this.projectiles.push(circleProjectile)
            }
            break

          case 3: // Random shot pattern
            for (let i = 0; i < 4; i++) {
              const randomProjectile = new ProjectileImpl(
                this.x + this.width / 2,
                this.y + this.height,
                6,
                8,
                colorPalettes.main.green,
                "rapid",
              )
              randomProjectile.isEnemyProjectile = true
              randomProjectile.speed = -3 - Math.random() * 2
              randomProjectile.dx = (Math.random() - 0.5) * 4
              randomProjectile.damage = 1
              this.projectiles.push(randomProjectile)
            }
            break

          case 4: // Final boss special attack - laser barrage
            if (this.multiShot) {
              for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2
                const laserProjectile = new ProjectileImpl(
                  this.x + this.width / 2,
                  this.y + this.height / 2,
                  4,
                  8,
                  colorPalettes.main.red,
                  "homing",
                )
                laserProjectile.isEnemyProjectile = true
                laserProjectile.speed = 4
                laserProjectile.dx = Math.cos(angle) * 4
                laserProjectile.speed = -Math.sin(angle) * 4
                laserProjectile.damage = 2
                this.projectiles.push(laserProjectile)
              }
            }
            break
        }
      }
    }

    // Update projectiles
    if (this.projectiles) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const projectile = this.projectiles[i]
        projectile.update()

        // Remove off-screen projectiles
        const canvas = document.querySelector("canvas")
        if (
          canvas &&
          (projectile.y > canvas.height || projectile.y < 0 || projectile.x < 0 || projectile.x > canvas.width)
        ) {
          this.projectiles.splice(i, 1)
        }
      }
    }

    this.draw()
  }

  // Separate update logic method (movement without drawing)
  updateLogic() {
    // Boss doesn't use standard enemy movement
    this.movementOffset += 0.02

    // Phase-based behavior
    this.phaseTimer++
    if (this.phaseTimer > 600) {
      // Change phase every 10 seconds
      this.phaseTimer = 0
      this.currentPhase = (this.currentPhase + 1) % this.maxPhases
    }

    // Different movement based on phase
    switch (this.currentPhase) {
      case 0: // Side-to-side movement
        this.x = 160 + Math.sin(this.movementOffset) * 120
        this.y = 80 + Math.sin(this.movementOffset * 0.5) * 20
        break
      case 1: // Circle pattern
        this.x = 160 + Math.cos(this.movementOffset) * 80
        this.y = 100 + Math.sin(this.movementOffset) * 40
        break
      case 2: // Aggressive forward and back
        this.x = 160 + Math.sin(this.movementOffset * 2) * 100
        this.y = 80 + Math.abs(Math.sin(this.movementOffset * 0.5)) * 60
        break
    }

    // Teleport ability for final boss
    if (this.canTeleport && Math.random() < 0.01) {
      // Random teleport
      this.x = Math.random() * (320 - this.width)
      this.y = 50 + Math.random() * 100
    }

    // Attack patterns
    this.attackTimer++

    const attackSpeed = this.multiShot ? 20 : 30 // Final boss attacks faster
    if (this.attackTimer > attackSpeed) {
      this.attackTimer = 0
      this.attackPattern = (this.attackPattern + 1) % (this.multiShot ? 5 : 4)

      // Create projectiles based on attack pattern
      if (this.projectiles) {
        switch (this.attackPattern) {
          case 0: // Single powerful shot
            const projectile = new ProjectileImpl(
              this.x + this.width / 2,
              this.y + this.height,
              8,
              12,
              colorPalettes.main.red,
              "default",
            )
            projectile.isEnemyProjectile = true
            projectile.speed = -5
            projectile.damage = 2
            this.projectiles.push(projectile)
            break

          case 1: // Spread shot
            for (let i = -2; i <= 2; i++) {
              const spreadProjectile = new ProjectileImpl(
                this.x + this.width / 2,
                this.y + this.height,
                6,
                8,
                colorPalettes.main.orange,
                "spread",
                i,
              )
              spreadProjectile.isEnemyProjectile = true
              spreadProjectile.speed = -4
              spreadProjectile.damage = 1
              this.projectiles.push(spreadProjectile)
            }
            break

          case 2: // Circle shot
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2
              const circleProjectile = new ProjectileImpl(
                this.x + this.width / 2,
                this.y + this.height / 2,
                5,
                5,
                colorPalettes.main.purple,
                "plasma",
              )
              circleProjectile.isEnemyProjectile = true
              circleProjectile.speed = 3
              circleProjectile.dx = Math.cos(angle) * 3
              circleProjectile.speed = -Math.sin(angle) * 3
              circleProjectile.damage = 1
              this.projectiles.push(circleProjectile)
            }
            break

          case 3: // Random shot pattern
            for (let i = 0; i < 4; i++) {
              const randomProjectile = new ProjectileImpl(
                this.x + this.width / 2,
                this.y + this.height,
                6,
                8,
                colorPalettes.main.green,
                "rapid",
              )
              randomProjectile.isEnemyProjectile = true
              randomProjectile.speed = -3 - Math.random() * 2
              randomProjectile.dx = (Math.random() - 0.5) * 4
              randomProjectile.damage = 1
              this.projectiles.push(randomProjectile)
            }
            break

          case 4: // Final boss special attack - laser barrage
            if (this.multiShot) {
              for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2
                const laserProjectile = new ProjectileImpl(
                  this.x + this.width / 2,
                  this.y + this.height / 2,
                  4,
                  8,
                  colorPalettes.main.red,
                  "homing",
                )
                laserProjectile.isEnemyProjectile = true
                laserProjectile.speed = 4
                laserProjectile.dx = Math.cos(angle) * 4
                laserProjectile.speed = -Math.sin(angle) * 4
                laserProjectile.damage = 2
                this.projectiles.push(laserProjectile)
              }
            }
            break
        }
      }
    }

    // Update projectiles
    if (this.projectiles) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const projectile = this.projectiles[i]
        if (projectile.updateLogic) {
          projectile.updateLogic()
        } else {
          projectile.update()
        }

        // Remove off-screen projectiles
        const canvas = document.querySelector("canvas")
        if (
          canvas &&
          (projectile.y > canvas.height || projectile.y < 0 || projectile.x < 0 || projectile.x > canvas.width)
        ) {
          this.projectiles.splice(i, 1)
        }
      }
    }
  }

  draw() {
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw larger, more detailed boss
    const pixels = pixelArtEnemies[this.typeIndex] || pixelArtEnemies[0] // Fallback to first type
    if (!pixels || !pixels[0]) return

    const pixelSize = Math.floor(this.width / pixels[0].length)

    // Draw boss with shield effect if in early phases
    if (this.health > this.maxHealth * 0.66) {
      ctx.globalAlpha = 0.3 + Math.sin(this.frame * 0.2) * 0.1
      ctx.fillStyle = colorPalettes.main.blue
      ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10)
      ctx.globalAlpha = 1.0
    }

    // Draw enemy base
    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        if (pixels[y][x] === 1) {
          // Alternate colors for animation
          const frameOffset = Math.floor(this.frame) % 3
          let color = this.color

          if (frameOffset === 1) color = colorPalettes.main.orange
          if (frameOffset === 2) color = colorPalettes.main.yellow

          ctx.fillStyle = color
          ctx.fillRect(this.x + x * pixelSize, this.y + y * pixelSize, pixelSize, pixelSize)
        }
      }
    }

    // Draw health bar using actual max health
    const healthBarWidth = this.width + 20
    const healthPercent = this.health / this.maxHealth

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(this.x - 10, this.y - 15, healthBarWidth, 5)

    ctx.fillStyle =
      this.health > this.maxHealth * 0.5 ? colorPalettes.main.green : this.health > this.maxHealth * 0.25 ? colorPalettes.main.yellow : colorPalettes.main.red
    ctx.fillRect(this.x - 10, this.y - 15, healthBarWidth * healthPercent, 5)

    // Update animation frame
    this.frame += this.animationSpeed
  }
}

// Projectile class implementation
export class ProjectileImpl implements Projectile {
  x: number
  y: number
  width: number
  height: number
  color: string
  speed = 6
  dx = 0
  homing = false
  type: string
  frame = 0
  animationSpeed = 0.2
  isEnemyProjectile?: boolean = false
  damage: number

  constructor(x: number, y: number, width: number, height: number, color: string, type = "default", dx = 0) {
    this.x = x - width / 2 // Center the projectile
    this.y = y - height
    this.width = width
    this.height = height
    this.color = color
    this.dx = dx
    this.type = type
    // Set damage based on projectile type
    this.damage = this.getDamage(type)
  }

  private getDamage(type: string): number {
    switch (type) {
      case "spread":
        return 1
      case "rapid":
        return 1
      case "plasma":
        return 2
      case "homing":
        return 3
      default:
        return 1
    }
  }

  draw() {
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw different projectile types with distinct visuals - all thin like before
    switch (this.type) {
      case "spread":
        // Spread projectiles - thin orange lines
        ctx.fillStyle = this.color
        ctx.fillRect(this.x + 2, this.y, 2, this.height)
        break
      case "rapid":
        // Rapid fire - very thin green lines
        ctx.fillStyle = this.color
        ctx.fillRect(this.x + 2, this.y, 1, this.height)
        break
      case "plasma":
        // Plasma - slightly thicker purple lines with glow
        ctx.fillStyle = this.color
        ctx.fillRect(this.x + 1, this.y, 3, this.height)
        // Add glow effect
        ctx.fillStyle = this.getLighterColor()
        ctx.fillRect(this.x + 2, this.y, 1, this.height)
        break
      case "homing":
        // Homing missiles - thin red lines
        ctx.fillStyle = this.color
        ctx.fillRect(this.x + 2, this.y, 2, this.height)
        break
      default:
        // Default laser - thin blue lines
        ctx.fillStyle = this.color
        ctx.fillRect(this.x + 2, this.y, 2, this.height)
        break
    }

    // Update animation frame
    this.frame += this.animationSpeed
  }



  getLighterColor() {
    // Return a lighter color for animation
    switch (this.color) {
      case colorPalettes.main.red:
        return colorPalettes.main.orange
      case colorPalettes.main.orange:
        return colorPalettes.main.yellow
      case colorPalettes.main.green:
        return colorPalettes.main.lightGreen
      case colorPalettes.main.blue:
        return colorPalettes.main.lightBlue
      case colorPalettes.main.purple:
        return colorPalettes.main.blue
      default:
        return colorPalettes.main.white
    }
  }

  update() {
    // If enemy projectile, move down
    if (this.isEnemyProjectile) {
      this.y -= this.speed // Speed is negative for enemy projectiles
    } else {
      // Player projectile moves up
      this.y -= this.speed
    }
    this.x += this.dx

    // Homing behavior
    if (this.homing) {
      const canvas = document.querySelector("canvas")
      if (!canvas) return

      // Find closest enemy
      // This would normally use the enemies array from the game state
      // As a placeholder, we'll leave the logic structure
      const closestEnemy = this.findClosestEnemy()

      if (closestEnemy) {
        // Adjust trajectory slightly towards enemy
        const dx = closestEnemy.x + closestEnemy.width / 2 - (this.x + this.width / 2)
        const adjustmentFactor = 0.1
        this.dx += (dx * adjustmentFactor) / this.speed

        // Limit maximum turning
        if (this.dx > 2) this.dx = 2
        if (this.dx < -2) this.dx = -2
      }
    }

    this.draw()
  }

  // Separate update logic method (movement without drawing)
  updateLogic() {
    // If enemy projectile, move down
    if (this.isEnemyProjectile) {
      this.y -= this.speed // Speed is negative for enemy projectiles
    } else {
      // Player projectile moves up
      this.y -= this.speed
    }
    this.x += this.dx

    // Homing behavior
    if (this.homing) {
      const canvas = document.querySelector("canvas")
      if (!canvas) return

      // Find closest enemy
      // This would normally use the enemies array from the game state
      // As a placeholder, we'll leave the logic structure
      const closestEnemy = this.findClosestEnemy()

      if (closestEnemy) {
        // Adjust trajectory slightly towards enemy
        const dx = closestEnemy.x + closestEnemy.width / 2 - (this.x + this.width / 2)
        const adjustmentFactor = 0.1
        this.dx += (dx * adjustmentFactor) / this.speed

        // Limit maximum turning
        if (this.dx > 2) this.dx = 2
        if (this.dx < -2) this.dx = -2
      }
    }
  }

  // Placeholder method - in the actual game this would use the enemies array
  private findClosestEnemy(): Enemy | null {
    return null
  }
}

// Explosion class implementation
export class ExplosionImpl implements Explosion {
  x: number
  y: number
  width: number
  height: number
  size: number
  frame = 0
  maxFrames: number
  animSpeed: number
  color: string

  constructor(x: number, y: number, size: number, color: string) {
    this.x = x
    this.y = y
    this.size = size
    this.width = size
    this.height = size
    this.maxFrames = pixelArtExplosion.length
    this.animSpeed = 0.2
    this.color = color
  }

  draw() {
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const frameIndex = Math.min(Math.floor(this.frame), this.maxFrames - 1)
    const pixels = pixelArtExplosion[frameIndex]
    if (!pixels || !pixels[0]) return
    
    const pixelSize = Math.floor(this.size / pixels.length)

    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        if (pixels[y][x] === 1) {
          // Alternate colors for animation
          ctx.fillStyle = this.frame % 1 > 0.5 ? this.color : this.getLighterColor()

          ctx.fillRect(
            this.x - this.size / 2 + x * pixelSize,
            this.y - this.size / 2 + y * pixelSize,
            pixelSize,
            pixelSize,
          )
        }
      }
    }
  }

  getLighterColor() {
    // Return a lighter color for animation
    switch (this.color) {
      case colorPalettes.main.red:
        return colorPalettes.main.orange
      case colorPalettes.main.orange:
        return colorPalettes.main.yellow
      case colorPalettes.main.green:
        return colorPalettes.main.lightGreen
      case colorPalettes.main.blue:
        return colorPalettes.main.lightBlue
      case colorPalettes.main.purple:
        return colorPalettes.main.blue
      default:
        return colorPalettes.main.white
    }
  }

  update() {
    this.frame += this.animSpeed
    this.draw()
    return this.frame < this.maxFrames
  }
}

// Particle class implementation
export class ParticleImpl implements Particle {
  x: number
  y: number
  width: number
  height: number
  size: number
  color: string
  velocity: { x: number; y: number }
  alpha = 1
  decay = 0.02

  constructor(x: number, y: number, size: number, color: string, velocity: { x: number; y: number }) {
    this.x = x
    this.y = y
    this.size = size
    this.width = size
    this.height = size
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.save()
    ctx.globalAlpha = this.alpha
    ctx.fillStyle = this.color
    ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size)
    ctx.restore()
  }

  update() {
    this.x += this.velocity.x
    this.y += this.velocity.y
    this.alpha -= this.decay
    this.draw()
  }
}

// Weapon pickup class implementation
export class WeaponPickupImpl implements WeaponPickup {
  x: number
  y: number
  width: number
  height: number
  speed: number
  weaponType: string
  type: string
  frame = 0
  animationSpeed = 0.1

  constructor(x: number, y: number, width: number, height: number, speed: number, weaponType: string) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.speed = speed
    this.weaponType = weaponType
    this.type = "weapon" // This distinguishes it from other pickups
  }

  draw() {
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw weapon pickup
    // Map weapon types to pixel art indices
    const weaponTypeMap: { [key: string]: number } = {
      "default": 0,
      "laser": 1,
      "spread": 2,
      "rapid": 1, // Use laser for rapid
      "plasma": 0, // Use default for plasma
      "homing": 3 // Use homing for homing
    }

    const weaponIndex = weaponTypeMap[this.weaponType] || 0
    const pixels = pixelArtWeapons[weaponIndex]
    if (!pixels || !pixels[0]) return

    const pixelSize = Math.floor(this.width / pixels[0].length)

    // Draw background
    ctx.fillStyle = this.getWeaponColor(0.5)
    ctx.fillRect(this.x, this.y, this.width, this.height)

    // Draw border
    ctx.strokeStyle = this.getWeaponColor()
    ctx.lineWidth = 1
    ctx.strokeRect(this.x, this.y, this.width, this.height)

    // Draw weapon icon
    for (let y = 0; y < pixels.length; y++) {
      for (let x = 0; x < pixels[y].length; x++) {
        if (pixels[y][x] === 1) {
          ctx.fillStyle = this.getWeaponColor()
          ctx.fillRect(
            this.x + (this.width - pixels[0].length * pixelSize) / 2 + x * pixelSize,
            this.y + (this.height - pixels.length * pixelSize) / 2 + y * pixelSize,
            pixelSize,
            pixelSize,
          )
        }
      }
    }

    // Animate pickup (pulsing)
    this.frame += this.animationSpeed
    if (this.frame >= Math.PI * 2) {
      this.frame = 0
    }
  }

  getWeaponColor(alpha = 1) {
    switch (this.weaponType) {
      case "spread":
        return alpha < 1 ? `rgba(255, 85, 0, ${alpha})` : colorPalettes.main.orange
      case "rapid":
        return alpha < 1 ? `rgba(0, 170, 0, ${alpha})` : colorPalettes.main.green
      case "plasma":
        return alpha < 1 ? `rgba(85, 0, 136, ${alpha})` : colorPalettes.main.purple
      case "homing":
        return alpha < 1 ? `rgba(255, 0, 0, ${alpha})` : colorPalettes.main.red
      default:
        return alpha < 1 ? `rgba(0, 85, 255, ${alpha})` : colorPalettes.main.blue
    }
  }

  update() {
    this.y += this.speed
    this.draw()
  }

  // Separate update logic method (movement without drawing)
  updateLogic() {
    this.y += this.speed
  }
}

// Power-up class implementation
export class PowerUpImpl implements PowerUp {
  x: number
  y: number
  width: number
  height: number
  speed: number
  type: PowerUpType
  frame = 0
  animationSpeed = 0.1
  duration: number

  constructor(x: number, y: number, width: number, height: number, speed: number, type: PowerUpType) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.speed = speed
    this.type = type

    // Set duration based on type
    switch (type) {
      case "shield":
        this.duration = 600 // 10 seconds at 60fps
        break
      case "speed":
        this.duration = 300 // 5 seconds
        break
      case "timeFreeze":
        this.duration = 180 // 3 seconds
        break
      case "extraLife":
      case "bomb":
      default:
        this.duration = 0 // Instant effect
    }
  }

  draw() {
    const canvas = document.querySelector("canvas")
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw power-up background
    ctx.fillStyle = this.getColor(0.5)
    ctx.fillRect(this.x, this.y, this.width, this.height)

    // Draw border
    ctx.strokeStyle = this.getColor()
    ctx.lineWidth = 1
    ctx.strokeRect(this.x, this.y, this.width, this.height)

    // Draw icon based on type
    ctx.fillStyle = this.getColor()

    switch (this.type) {
      case "shield":
        // Draw shield icon
        ctx.beginPath()
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 3, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 4, 0, Math.PI * 2)
        ctx.fill()
        break
      case "speed":
        // Draw speed icon
        ctx.beginPath()
        ctx.moveTo(this.x + this.width / 4, this.y + this.height / 4)
        ctx.lineTo(this.x + (this.width * 3) / 4, this.y + this.height / 2)
        ctx.lineTo(this.x + this.width / 4, this.y + (this.height * 3) / 4)
        ctx.fill()
        break
      case "extraLife":
        // Draw heart icon
        ctx.beginPath()
        ctx.arc(this.x + this.width / 3, this.y + this.height / 2, this.width / 6, 0, Math.PI * 2)
        ctx.arc(this.x + (this.width * 2) / 3, this.y + this.height / 2, this.width / 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(this.x + this.width / 6, this.y + this.height / 2)
        ctx.lineTo(this.x + this.width / 2, this.y + (this.height * 3) / 4)
        ctx.lineTo(this.x + (this.width * 5) / 6, this.y + this.height / 2)
        ctx.fill()
        break
      case "bomb":
        // Draw bomb icon
        ctx.beginPath()
        ctx.arc(this.x + this.width / 2, this.y + (this.height * 2) / 3, this.width / 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.rect(this.x + this.width / 2 - 2, this.y + this.height / 4, 4, this.height / 3)
        ctx.fill()
        break
      case "timeFreeze":
        // Draw clock icon
        ctx.beginPath()
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 3, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2)
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 3)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2)
        ctx.lineTo(this.x + (this.width * 2) / 3, this.y + this.height / 2)
        ctx.stroke()
        break
    }

    // Animate pickup (pulsing)
    this.frame += this.animationSpeed
    if (this.frame >= Math.PI * 2) {
      this.frame = 0
    }
  }

  getColor(alpha = 1) {
    switch (this.type) {
      case "shield":
        return alpha < 1 ? `rgba(0, 85, 255, ${alpha})` : colorPalettes.main.blue
      case "speed":
        return alpha < 1 ? `rgba(0, 170, 0, ${alpha})` : colorPalettes.main.green
      case "extraLife":
        return alpha < 1 ? `rgba(255, 85, 0, ${alpha})` : colorPalettes.main.orange
      case "bomb":
        return alpha < 1 ? `rgba(255, 0, 0, ${alpha})` : colorPalettes.main.red
      case "timeFreeze":
        return alpha < 1 ? `rgba(85, 0, 136, ${alpha})` : colorPalettes.main.purple
      default:
        return alpha < 1 ? `rgba(255, 255, 55, ${alpha})` : colorPalettes.main.yellow
    }
  }

  update() {
    this.y += this.speed
    this.draw()
  }

  // Separate update logic method (movement without drawing)
  updateLogic() {
    this.y += this.speed
  }
}
