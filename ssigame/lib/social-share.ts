// Social sharing utility functions

type ShareableContent = {
  title: string
  text: string
  url: string
  hashtags?: string[]
  image?: string
}

/**
 * Check if the Web Share API is available
 */
export function isWebShareAvailable(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share
}

/**
 * Share content using the Web Share API if available
 */
export async function shareContent(content: ShareableContent): Promise<boolean> {
  if (isWebShareAvailable()) {
    try {
      await navigator.share({
        title: content.title,
        text: content.text,
        url: content.url,
      })
      return true
    } catch (error) {
      console.error("Error sharing content:", error)
      return false
    }
  }
  return false
}

/**
 * Copy content to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Error copying to clipboard:", error)

    // Fallback method for older browsers
    try {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const successful = document.execCommand("copy")
      document.body.removeChild(textArea)
      return successful
    } catch (fallbackError) {
      console.error("Fallback clipboard copy failed:", fallbackError)
      return false
    }
  }
}

/**
 * Generate Twitter/X share URL
 */
export function getTwitterShareUrl(content: ShareableContent): string {
  const params = new URLSearchParams({
    text: `${content.text}`,
    url: content.url,
  })

  if (content.hashtags && content.hashtags.length > 0) {
    params.append("hashtags", content.hashtags.join(","))
  }

  return `https://twitter.com/intent/tweet?${params.toString()}`
}

/**
 * Generate Facebook share URL
 */
export function getFacebookShareUrl(content: ShareableContent): string {
  const params = new URLSearchParams({
    u: content.url,
    quote: content.text,
  })

  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
}

/**
 * Generate LinkedIn share URL
 */
export function getLinkedInShareUrl(content: ShareableContent): string {
  const params = new URLSearchParams({
    url: content.url,
    title: content.title,
    summary: content.text,
  })

  return `https://www.linkedin.com/shareArticle?mini=true&${params.toString()}`
}

/**
 * Generate WhatsApp share URL
 */
export function getWhatsAppShareUrl(content: ShareableContent): string {
  const text = `${content.title}: ${content.text} ${content.url}`
  const params = new URLSearchParams({
    text,
  })

  return `https://wa.me/?${params.toString()}`
}

/**
 * Generate Telegram share URL
 */
export function getTelegramShareUrl(content: ShareableContent): string {
  const params = new URLSearchParams({
    url: content.url,
    text: `${content.title}: ${content.text}`,
  })

  return `https://t.me/share/url?${params.toString()}`
}

/**
 * Generate Reddit share URL
 */
export function getRedditShareUrl(content: ShareableContent): string {
  const params = new URLSearchParams({
    url: content.url,
    title: `${content.title}: ${content.text}`,
  })

  return `https://www.reddit.com/submit?${params.toString()}`
}

/**
 * Generate Email share URL
 */
export function getEmailShareUrl(content: ShareableContent): string {
  const params = new URLSearchParams({
    subject: content.title,
    body: `${content.text}\n\n${content.url}`,
  })

  return `mailto:?${params.toString()}`
}

/**
 * Format achievement for sharing
 */
export function formatAchievementForSharing(achievementName: string, achievementDescription: string): ShareableContent {
  return {
    title: `I unlocked the "${achievementName}" achievement in S.S.I.!`,
    text: `I just unlocked the "${achievementName}" achievement in SOL SPACE INVADERS: ${achievementDescription}`,
    url: `${getBaseUrl()}/achievements?highlight=${encodeURIComponent(achievementName)}`,
    hashtags: ["BSI", "BonkSpaceInvaders", "GameAchievement"],
  }
}

/**
 * Format high score for sharing
 */
export function formatHighScoreForSharing(score: number, level: number): ShareableContent {
  return {
    title: `New High Score in S.S.I.!`,
    text: `I just scored ${score} points and reached level ${level} in SOL SPACE INVADERS! Can you beat my score?`,
    url: `${getBaseUrl()}/leaderboard`,
    hashtags: ["BSI", "BonkSpaceInvaders", "HighScore", "Gaming"],
  }
}

/**
 * Format challenge victory for sharing
 */
export function formatChallengeVictoryForSharing(
  opponentName: string,
  playerScore: number,
  opponentScore: number,
): ShareableContent {
  return {
    title: `I won a S.S.I. challenge!`,
    text: `I just defeated ${opponentName} in a SOL SPACE INVADERS challenge with a score of ${playerScore} vs ${opponentScore}! Who wants to challenge me next?`,
    url: `${getBaseUrl()}/challenges`,
    hashtags: ["BSI", "BonkSpaceInvaders", "GamingChallenge", "Victory"],
  }
}

/**
 * Format level completion for sharing
 */
export function formatLevelCompletionForSharing(level: number, score: number, perfect: boolean): ShareableContent {
  let text = `I just completed level ${level} in SOL SPACE INVADERS with a score of ${score}!`
  if (perfect) {
    text += " Perfect run - no damage taken!"
  }

  return {
    title: `Level ${level} completed in S.S.I.!`,
    text,
    url: `${getBaseUrl()}/game`,
    hashtags: ["BSI", "BonkSpaceInvaders", "GamingMilestone", perfect ? "PerfectRun" : "LevelComplete"],
  }
}

/**
 * Format boss defeat for sharing
 */
export function formatBossDefeatForSharing(bossLevel: number): ShareableContent {
  return {
    title: `Boss defeated in S.S.I.!`,
    text: `I just defeated the level ${bossLevel} boss in SOL SPACE INVADERS! The galaxy is a little safer now.`,
    url: `${getBaseUrl()}/game`,
    hashtags: ["BSI", "BonkSpaceInvaders", "BossDefeat", "GamingVictory"],
  }
}

/**
 * Get base URL for the application
 */
function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    const { protocol, host } = window.location
    return `${protocol}//${host}`
  }

  // Fallback to environment variable or default URL if not in browser context
  return process.env.NEXT_PUBLIC_BASE_URL || "https://bsi-game.vercel.app"
}
