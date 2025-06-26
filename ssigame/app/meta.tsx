import type { Metadata } from "next"

// Base metadata for the entire application
export const baseMetadata: Metadata = {
  title: "S.S.I. - SOL SPACE INVADERS",
  description: "A retro arcade game powered by BSI tokens featuring Bonk the dog defending the galaxy!",
  keywords: ["game", "arcade", "retro", "space invaders", "bonk", "BSI", "blockchain", "web game"],
  authors: [{ name: "BSI Game Team" }],
  creator: "BSI Game Team",
  publisher: "BSI Game",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bsi-game.vercel.app",
    siteName: "S.S.I. - SOL SPACE INVADERS",
    title: "S.S.I. - SOL SPACE INVADERS",
    description: "A retro arcade game powered by BSI tokens featuring Bonk the dog defending the galaxy!",
    images: [
      {
        url: "https://bsi-game.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "S.S.I. - SOL SPACE INVADERS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "S.S.I. - SOL SPACE INVADERS",
    description: "A retro arcade game powered by BSI tokens featuring Bonk the dog defending the galaxy!",
    images: ["https://bsi-game.vercel.app/api/og"],
    creator: "@BSIGame",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

// Generate metadata for achievement pages
export function generateAchievementMetadata(achievementName: string, achievementDescription: string): Metadata {
  const title = `${achievementName} Achievement - S.S.I.`
  const description = `I just unlocked the "${achievementName}" achievement in SOL SPACE INVADERS: ${achievementDescription}`
  const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(
    description,
  )}&achievement=${encodeURIComponent(achievementName)}`

  return {
    title,
    description,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

// Generate metadata for high score pages
export function generateHighScoreMetadata(score: number, level: number): Metadata {
  const title = `High Score: ${score} - S.S.I.`
  const description = `I just scored ${score} points and reached level ${level} in SOL SPACE INVADERS! Can you beat my score?`
  const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(
    description,
  )}&score=${score}&level=${level}`

  return {
    title,
    description,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
      images: [ogImageUrl],
    },
  }
}
