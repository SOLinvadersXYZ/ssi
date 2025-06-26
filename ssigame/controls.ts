import { isMobileDevice } from "./utils"

// Virtual joystick for mobile devices
export class VirtualJoystick {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private containerElement: HTMLDivElement | null = null
  private joystickRadius = 50
  private knobRadius = 20
  private position = { x: 0, y: 0 }
  private centerPosition = { x: 0, y: 0 }
  private isActive = false
  private touchId: number | null = null
  private onChange: (x: number, y: number) => void

  constructor(onChange: (x: number, y: number) => void) {
    this.onChange = onChange
    this.setupJoystick()
  }

  private setupJoystick() {
    // Create container element
    this.containerElement = document.createElement("div")
    this.containerElement.style.position = "absolute"
    this.containerElement.style.bottom = "20px"
    this.containerElement.style.left = "20px"
    this.containerElement.style.width = `${this.joystickRadius * 2}px`
    this.containerElement.style.height = `${this.joystickRadius * 2}px`
    this.containerElement.style.zIndex = "1000"
    this.containerElement.style.display = "none" // Initially hidden
    this.containerElement.style.touchAction = "none" // Prevent default touch actions

    // Create canvas
    this.canvas = document.createElement("canvas")
    this.canvas.width = this.joystickRadius * 2
    this.canvas.height = this.joystickRadius * 2
    this.containerElement.appendChild(this.canvas)

    // Get context
    this.ctx = this.canvas.getContext("2d")

    // Set center position
    this.centerPosition = {
      x: this.joystickRadius,
      y: this.joystickRadius,
    }

    // Reset position
    this.position = { ...this.centerPosition }

    // Add to DOM
    document.body.appendChild(this.containerElement)

    // Add event listeners
    this.addEventListeners()

    // Draw initial state
    this.draw()
  }

  private addEventListeners() {
    if (!this.canvas) return

    this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this))
    document.addEventListener("touchmove", this.handleTouchMove.bind(this))
    document.addEventListener("touchend", this.handleTouchEnd.bind(this))
    document.addEventListener("touchcancel", this.handleTouchEnd.bind(this))
  }

  private handleTouchStart(event: TouchEvent) {
    event.preventDefault()

    if (this.isActive) return

    const touch = event.touches[0]
    this.touchId = touch.identifier

    // Get touch position relative to canvas
    const rect = this.canvas!.getBoundingClientRect()
    this.position = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }

    // Constrain position within joystick radius
    this.constrainPosition()

    this.isActive = true
    this.draw()
    this.emitChange()
  }

  private handleTouchMove(event: TouchEvent) {
    event.preventDefault()

    if (!this.isActive) return

    // Find our touch
    let touch: Touch | undefined

    for (let i = 0; i < event.touches.length; i++) {
      if (event.touches[i].identifier === this.touchId) {
        touch = event.touches[i]
        break
      }
    }

    if (!touch) return

    // Get touch position relative to canvas
    const rect = this.canvas!.getBoundingClientRect()
    this.position = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }

    // Constrain position within joystick radius
    this.constrainPosition()

    this.draw()
    this.emitChange()
  }

  private handleTouchEnd(event: TouchEvent) {
    // Check if our touch ended
    let touchEnded = true

    for (let i = 0; i < event.touches.length; i++) {
      if (event.touches[i].identifier === this.touchId) {
        touchEnded = false
        break
      }
    }

    if (touchEnded) {
      this.isActive = false
      this.touchId = null

      // Reset position to center
      this.position = { ...this.centerPosition }

      this.draw()
      this.emitChange()
    }
  }

  private constrainPosition() {
    const dx = this.position.x - this.centerPosition.x
    const dy = this.position.y - this.centerPosition.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > this.joystickRadius - this.knobRadius) {
      const angle = Math.atan2(dy, dx)
      const maxDistance = this.joystickRadius - this.knobRadius

      this.position = {
        x: this.centerPosition.x + Math.cos(angle) * maxDistance,
        y: this.centerPosition.y + Math.sin(angle) * maxDistance,
      }
    }
  }

  private draw() {
    if (!this.ctx || !this.canvas) return

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw joystick background
    this.ctx.beginPath()
    this.ctx.arc(this.centerPosition.x, this.centerPosition.y, this.joystickRadius, 0, Math.PI * 2)
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    this.ctx.fill()
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
    this.ctx.lineWidth = 2
    this.ctx.stroke()

    // Draw active knob
    this.ctx.beginPath()
    this.ctx.arc(this.position.x, this.position.y, this.knobRadius, 0, Math.PI * 2)
    this.ctx.fillStyle = this.isActive ? "rgba(255, 170, 0, 0.8)" : "rgba(255, 255, 255, 0.5)"
    this.ctx.fill()
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"
    this.ctx.lineWidth = 2
    this.ctx.stroke()
  }

  private emitChange() {
    // Calculate normalized direction (-1 to 1)
    const dx = (this.position.x - this.centerPosition.x) / (this.joystickRadius - this.knobRadius)
    const dy = (this.position.y - this.centerPosition.y) / (this.joystickRadius - this.knobRadius)

    this.onChange(dx, dy)
  }

  show() {
    if (this.containerElement) {
      this.containerElement.style.display = "block"
    }
  }

  hide() {
    if (this.containerElement) {
      this.containerElement.style.display = "none"
    }
  }
}

// Virtual button for mobile devices
export class VirtualButton {
  private button: HTMLButtonElement | null = null
  private onPress: () => void
  private onHold?: () => void
  private isActive = false
  private isHolding = false
  private holdTimer: number | null = null
  private holdInterval: number | null = null
  private label: string
  private position: { bottom: string; right: string }

  constructor(
    label: string,
    onPress: () => void,
    position: { bottom: string; right: string } = { bottom: "20px", right: "20px" },
    onHold?: () => void,
  ) {
    this.label = label
    this.onPress = onPress
    this.onHold = onHold
    this.position = position
    this.setupButton()
  }

  private setupButton() {
    // Create button element
    this.button = document.createElement("button")
    this.button.innerText = this.label
    this.button.style.position = "absolute"
    this.button.style.bottom = this.position.bottom
    this.button.style.right = this.position.right
    this.button.style.width = "80px"
    this.button.style.height = "80px"
    this.button.style.borderRadius = "50%"
    this.button.style.backgroundColor = "rgba(255, 170, 0, 0.5)"
    this.button.style.border = "2px solid rgba(255, 255, 255, 0.6)"
    this.button.style.color = "white"
    this.button.style.fontSize = "16px"
    this.button.style.fontWeight = "bold"
    this.button.style.cursor = "pointer"
    this.button.style.zIndex = "1000"
    this.button.style.display = "none" // Initially hidden
    this.button.style.touchAction = "none" // Prevent default touch actions
    this.button.style.userSelect = "none" // Prevent text selection
    ;(this.button.style as any).webkitTapHighlightColor = "transparent" // Remove tap highlight on iOS

    // Add to DOM
    document.body.appendChild(this.button)

    // Add event listeners
    this.addEventListeners()
  }

  private addEventListeners() {
    if (!this.button) return

    // Use touchstart/touchend for mobile devices
    this.button.addEventListener("touchstart", (e) => {
      e.preventDefault()
      this.isActive = true
      this.updateStyle()
      
      // Call onPress immediately
      this.onPress()
      
      // Set up hold functionality if onHold is provided
      if (this.onHold) {
        this.holdTimer = window.setTimeout(() => {
          this.isHolding = true
          this.holdInterval = window.setInterval(() => {
            if (this.isActive && this.onHold) {
              this.onHold()
            }
          }, 100) // Hold repeat rate: 10 times per second
        }, 200) // Start holding after 200ms
      }
    })

    this.button.addEventListener("touchend", (e) => {
      e.preventDefault()
      this.stopHolding()
      this.isActive = false
      this.updateStyle()
    })

    this.button.addEventListener("touchcancel", (e) => {
      e.preventDefault()
      this.stopHolding()
      this.isActive = false
      this.updateStyle()
    })
  }

  private stopHolding() {
    this.isHolding = false
    if (this.holdTimer) {
      clearTimeout(this.holdTimer)
      this.holdTimer = null
    }
    if (this.holdInterval) {
      clearInterval(this.holdInterval)
      this.holdInterval = null
    }
  }

  private updateStyle() {
    if (!this.button) return

    if (this.isActive) {
      this.button.style.backgroundColor = "rgba(255, 170, 0, 0.8)"
      this.button.style.transform = "scale(0.95)"
    } else {
      this.button.style.backgroundColor = "rgba(255, 170, 0, 0.5)"
      this.button.style.transform = "scale(1.0)"
    }
  }

  show() {
    if (this.button) {
      this.button.style.display = "block"
    }
  }

  hide() {
    if (this.button) {
      this.button.style.display = "none"
    }
    this.stopHolding()
  }
}

// Mobile controls manager
export class MobileControlsManager {
  private joystick: VirtualJoystick | null = null
  private fireButton: VirtualButton | null = null
  private pauseButton: VirtualButton | null = null
  private bombButton: VirtualButton | null = null
  private isMobile: boolean

  constructor(
    onJoystickMove: (x: number, y: number) => void,
    onFirePress: () => void,
    onPausePress: () => void,
    onBombPress: () => void,
    onFireHold?: () => void,
  ) {
    this.isMobile = isMobileDevice()

    if (this.isMobile) {
      this.joystick = new VirtualJoystick(onJoystickMove)
      this.fireButton = new VirtualButton("FIRE", onFirePress, { bottom: "20px", right: "20px" }, onFireHold)
      this.pauseButton = new VirtualButton("||", onPausePress, { bottom: "100px", right: "20px" })
      this.bombButton = new VirtualButton("BOMB", onBombPress, { bottom: "20px", right: "110px" })

      // Add orientation change listener
      window.addEventListener("orientationchange", this.handleOrientationChange.bind(this))
    }
  }

  show() {
    if (!this.isMobile) return

    // Get screen dimensions
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // Adjust joystick position based on screen size
    if (this.joystick) {
      const joystickElement = this.joystick as any
      if (joystickElement.containerElement) {
        // For smaller screens, position joystick closer to the edge
        if (screenWidth < 768) {
          joystickElement.containerElement.style.bottom = "10px"
          joystickElement.containerElement.style.left = "10px"
        } else {
          joystickElement.containerElement.style.bottom = "20px"
          joystickElement.containerElement.style.left = "20px"
        }

        // Show the joystick
        joystickElement.show()
      }
    }

    // Adjust button positions based on screen size
    if (this.fireButton) {
      const fireButtonElement = this.fireButton as any
      if (fireButtonElement.button) {
        // For smaller screens, make buttons slightly smaller and reposition
        if (screenWidth < 768) {
          fireButtonElement.button.style.width = "70px"
          fireButtonElement.button.style.height = "70px"
          fireButtonElement.button.style.bottom = "10px"
          fireButtonElement.button.style.right = "10px"
        } else {
          fireButtonElement.button.style.width = "80px"
          fireButtonElement.button.style.height = "80px"
          fireButtonElement.button.style.bottom = "20px"
          fireButtonElement.button.style.right = "20px"
        }

        // Show the fire button
        fireButtonElement.show()
      }
    }

    // Adjust pause button position
    if (this.pauseButton) {
      const pauseButtonElement = this.pauseButton as any
      if (pauseButtonElement.button) {
        if (screenWidth < 768) {
          pauseButtonElement.button.style.width = "50px"
          pauseButtonElement.button.style.height = "50px"
          pauseButtonElement.button.style.bottom = "90px"
          pauseButtonElement.button.style.right = "10px"
        } else {
          pauseButtonElement.button.style.width = "60px"
          pauseButtonElement.button.style.height = "60px"
          pauseButtonElement.button.style.bottom = "100px"
          pauseButtonElement.button.style.right = "20px"
        }

        // Show the pause button
        pauseButtonElement.show()
      }
    }

    // Adjust bomb button position
    if (this.bombButton) {
      const bombButtonElement = this.bombButton as any
      if (bombButtonElement.button) {
        if (screenWidth < 768) {
          bombButtonElement.button.style.width = "70px"
          bombButtonElement.button.style.height = "70px"
          bombButtonElement.button.style.bottom = "10px"
          bombButtonElement.button.style.right = "90px"
        } else {
          bombButtonElement.button.style.width = "80px"
          bombButtonElement.button.style.height = "80px"
          bombButtonElement.button.style.bottom = "20px"
          bombButtonElement.button.style.right = "110px"
        }

        // Show the bomb button
        bombButtonElement.show()
      }
    }
  }

  hide() {
    if (!this.isMobile) return

    this.joystick?.hide()
    this.fireButton?.hide()
    this.pauseButton?.hide()
    this.bombButton?.hide()
  }

  isMobileDevice(): boolean {
    return this.isMobile
  }

  handleOrientationChange() {
    // Hide controls briefly
    this.hide()

    // Wait for orientation change to complete
    setTimeout(() => {
      // Show controls with updated positions
      this.show()
    }, 300)
  }

  cleanup() {
    this.hide()

    // Remove orientation change listener
    if (this.isMobile) {
      window.removeEventListener("orientationchange", this.handleOrientationChange.bind(this))
    }
  }
}

// Keyboard manager for desktop
export class KeyboardManager {
  private keys: { [key: string]: boolean } = {}
  private handlers: { [key: string]: () => void } = {}

  constructor() {
    this.setupListeners()
  }

  private setupListeners() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this))
    window.addEventListener("keyup", this.handleKeyUp.bind(this))
  }

  private handleKeyDown(e: KeyboardEvent) {
    this.keys[e.key] = true

    if (this.handlers[e.key]) {
      this.handlers[e.key]()
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys[e.key] = false
  }

  isKeyPressed(key: string): boolean {
    return !!this.keys[key]
  }

  onKeyPress(key: string, handler: () => void) {
    this.handlers[key] = handler
  }

  getMovementDirection(): { x: number; y: number } {
    const direction = { x: 0, y: 0 }

    // Check arrow keys and WASD
    if (this.isKeyPressed("ArrowLeft") || this.isKeyPressed("a")) {
      direction.x = -1
    } else if (this.isKeyPressed("ArrowRight") || this.isKeyPressed("d")) {
      direction.x = 1
    }

    if (this.isKeyPressed("ArrowUp") || this.isKeyPressed("w")) {
      direction.y = -1
    } else if (this.isKeyPressed("ArrowDown") || this.isKeyPressed("s")) {
      direction.y = 1
    }

    return direction
  }

  cleanup() {
    window.removeEventListener("keydown", this.handleKeyDown)
    window.removeEventListener("keyup", this.handleKeyUp)
  }
}
