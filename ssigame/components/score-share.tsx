"use client"

import { useState } from "react"
import { ShareButton } from "@/components/share-button"
import { formatHighScoreForSharing } from "@/lib/social-share"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy, Share2 } from "lucide-react"

interface ScoreShareProps {
  score: number
  level: number
  variant?: "default" | "minimal" | "inline"
  buttonText?: string
}

export function ScoreShare({ score, level, variant = "default", buttonText = "Share Score" }: ScoreShareProps) {
  const [isOpen, setIsOpen] = useState(false)

  const shareContent = formatHighScoreForSharing(score, level)

  if (variant === "minimal") {
    return <ShareButton content={shareContent} variant="ghost" size="icon" iconOnly />
  }

  if (variant === "inline") {
    return <ShareButton content={shareContent} variant="outline" size="sm" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Score</DialogTitle>
          <DialogDescription>Share your high score with friends and on social media.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center justify-center p-4 bg-gray-900 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-lg font-bold text-yellow-400">Score: {score}</h3>
              <p className="text-sm text-center text-gray-300">Level: {level}</p>
            </div>
          </div>
          <div className="flex justify-center">
            <ShareButton content={shareContent} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
