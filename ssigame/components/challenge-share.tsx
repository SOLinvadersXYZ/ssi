"use client"

import { useState } from "react"
import { ShareButton } from "@/components/share-button"
import { formatChallengeVictoryForSharing } from "@/lib/social-share"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Swords, Share2 } from "lucide-react"

interface ChallengeShareProps {
  opponentName: string
  playerScore: number
  opponentScore: number
  variant?: "default" | "minimal" | "inline"
}

export function ChallengeShare({ opponentName, playerScore, opponentScore, variant = "default" }: ChallengeShareProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Only allow sharing if player won
  if (playerScore <= opponentScore) {
    return null
  }

  const shareContent = formatChallengeVictoryForSharing(opponentName, playerScore, opponentScore)

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
          Share Victory
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Victory</DialogTitle>
          <DialogDescription>Share your challenge victory with friends and on social media.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center justify-center p-4 bg-gray-900 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center">
                <Swords className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-lg font-bold text-yellow-400">Victory!</h3>
              <p className="text-sm text-center text-gray-300">
                You defeated {opponentName} with a score of {playerScore} vs {opponentScore}
              </p>
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
