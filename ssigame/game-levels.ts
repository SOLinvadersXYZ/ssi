import { Level } from './types';

// Define game levels with increasing difficulty
export const levels: Level[] = [
  {
    number: 1,
    name: "Beginner Space",
    enemySpawnRate: 60, // Frames between enemy spawns
    enemySpeedMultiplier: 1.0,
    bossLevel: false,
    background: "space",
    maxEnemies: 25, // Slightly increased for better pacing
    powerUpChance: 0.15, // Increased for new players
    specialEnemies: false
  },
  {
    number: 2,
    name: "Asteroid Field",
    enemySpawnRate: 50,
    enemySpeedMultiplier: 1.1, // Slightly reduced jump
    bossLevel: false,
    background: "asteroids",
    maxEnemies: 35, // Better progression
    powerUpChance: 0.18, // Generous power-ups
    specialEnemies: false
  },
  {
    number: 3,
    name: "Enemy Fleet",
    enemySpawnRate: 42, // Smoother difficulty curve
    enemySpeedMultiplier: 1.25,
    bossLevel: false,
    background: "fleet",
    maxEnemies: 45, // Increased challenge
    powerUpChance: 0.22, // Prepare for boss
    specialEnemies: true
  },
  {
    number: 4,
    name: "Boss Battle",
    enemySpawnRate: 35, // Slightly easier spawn rate for boss level
    enemySpeedMultiplier: 1.3,
    bossLevel: true,
    background: "boss",
    maxEnemies: 25, // More enemies for epic feel
    powerUpChance: 0.3, // High power-up chance for boss fight
    specialEnemies: true
  },
  {
    number: 5,
    name: "Deep Space",
    enemySpawnRate: 28, // Faster spawning
    enemySpeedMultiplier: 1.45,
    bossLevel: false,
    background: "deepspace",
    maxEnemies: 55, // Challenging but fair
    powerUpChance: 0.25, // Balanced for difficulty
    specialEnemies: true
  },
  {
    number: 6,
    name: "Final Frontier",
    enemySpawnRate: 22, // Intense final level
    enemySpeedMultiplier: 1.55, // Slightly reduced from 1.6 for fairness
    bossLevel: true,
    background: "frontier",
    maxEnemies: 40, // Reduced for final boss focus
    powerUpChance: 0.35, // Maximum power-ups for final challenge
    specialEnemies: true
  }
];

// Helper function to get level by number
export function getLevelByNumber(levelNumber: number): Level | undefined {
  return levels.find(level => level.number === levelNumber);
}

// Helper function to get next level
export function getNextLevel(currentLevel: number): Level | undefined {
  return levels.find(level => level.number === currentLevel + 1);
}

// Helper function to check if level is final
export function isFinalLevel(levelNumber: number): boolean {
  return levelNumber >= levels.length;
}

// Helper function to get level difficulty rating
export function getLevelDifficulty(levelNumber: number): 'Easy' | 'Medium' | 'Hard' | 'Boss' | 'Final Boss' {
  const level = getLevelByNumber(levelNumber);
  if (!level) return 'Easy';
  
  if (level.bossLevel && levelNumber === levels.length) return 'Final Boss';
  if (level.bossLevel) return 'Boss';
  if (levelNumber <= 2) return 'Easy';
  if (levelNumber <= 4) return 'Medium';
  return 'Hard';
}

// Export level count for easy reference
export const TOTAL_LEVELS = levels.length;
