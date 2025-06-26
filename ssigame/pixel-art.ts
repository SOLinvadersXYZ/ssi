// Pixel art for the game
// 1 represents a filled pixel, 0 represents an empty pixel

// Color palettes for the game
export const colorPalettes = {
  main: {
    white: "#FFFFFF",
    lightGray: "#CCCCCC",
    darkGray: "#666666",
    yellow: "#FFD700",
    orange: "#FFA500",
    red: "#FF0000",
    green: "#00FF00",
    blue: "#0000FF",
    purple: "#800080",
    darkPurple: "#4B0082",
    cyan: "#00FFFF",
    darkBlue: "#000033",
    // High-contrast colors for better visibility
    brightRed: "#FF3333",
    brightOrange: "#FF7F00",
    brightYellow: "#FFFF33",
    brightGreen: "#33FF33",
    brightBlue: "#3333FF",
    brightPurple: "#CC33FF",
    brightCyan: "#33FFFF",
    brightPink: "#FF33CC",
    lime: "#CCFF33",
    magenta: "#FF33AA",
        // Additional colors for consistent naming
    teal: "#008080",
    violet: "#8A2BE2",
    lightGreen: "#90EE90",
    babyBlue: "#87CEEB",
    superDarkGrey: "#1C1C1C",
    lightGrey: "#D3D3D3",
    // Level-specific backgrounds - completely distinct colors
    space: "#1C1C1C",        // Level 1: Super Dark Grey
    asteroids: "#008080",    // Level 2: Teal
    fleet: "#90EE90",        // Level 3: Light Green
    boss: "#8A2BE2",         // Level 4: Violet
    deepspace: "#87CEEB",    // Level 5: Baby Blue
    frontier: "#D3D3D3"      // Level 6: Light Grey
  },
  ui: {
    background: "#111122",
    text: "#FFFFFF",
    highlight: "#FFD700",
    button: "#333366",
    buttonHover: "#444488",
    border: "#444444"
  },
  sun: {
    lightYellow: "#FFFFAA",
    yellow: "#FFFF00",
    orange: "#FFA500",
    darkOrange: "#FF8000"
  }
};

// Bonk dog pixel art (simplified)
export const pixelArtDog = [
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0]
];

// Sun pixel art
export const pixelArtSun = [
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0]
];

// Spaceship pixel art (renamed to pixelArtShip for compatibility)
export const pixelArtShip = [
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1]
];

// Alias for backward compatibility
export const pixelArtSpaceship = pixelArtShip;

// Thrusters pixel art
export const pixelArtThrusters = [
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
  [1, 1, 0, 1, 1, 1, 1, 0, 1, 1]
];

// Exclamation mark pixel art
export const pixelArtExclamation = [
  [0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 0, 0]
];

// Enemy pixel art
export const pixelArtEnemy = [
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Multiple enemy types for variety
export const pixelArtEnemies = [
  // Type 0 - Standard enemy
  [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  // Type 1 - Octopus-like enemy
  [
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0]
  ],
  // Type 2 - Crab-like enemy
  [
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [0, 1, 0, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 0, 1, 1, 0, 0, 1, 1]
  ]
];

// Small enemy variants
export const pixelArtEnemiesSmall = [
  // Small Type 0
  [
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0]
  ],
  // Small Type 1
  [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0, 1, 0, 0]
  ],
  // Small Type 2
  [
    [1, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 1]
  ]
];

// Boss pixel art
export const pixelArtBoss = [
  [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0]
];

// Explosion animation frames
export const pixelArtExplosion = [
  // Frame 1
  [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0]
  ],
  // Frame 2
  [
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0]
  ],
  // Frame 3
  [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  // Frame 4
  [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ]
];

// Projectile types
export const pixelArtProjectiles = [
  // Default projectile
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0]
  ],
  // Laser projectile
  [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0]
  ],
  // Spread projectile
  [
    [1, 0, 1],
    [0, 1, 0],
    [1, 0, 1]
  ],
  // Enemy projectile
  [
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0]
  ]
];

// Weapon pickup types
export const pixelArtWeapons = [
  // Default weapon
  [
    [0, 1, 0],
    [1, 1, 1],
    [1, 1, 1]
  ],
  // Laser weapon
  [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1]
  ],
  // Spread weapon
  [
    [1, 0, 1],
    [0, 1, 0],
    [1, 1, 1]
  ],
  // Homing weapon
  [
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 0]
  ]
];
