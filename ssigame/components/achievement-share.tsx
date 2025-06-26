"use client"

import { useState } from "react"
import { ShareButton } from "@/components/share-button"
import { formatAchievementForSharing } from "@/lib/social-share"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Award, Share2 } from "lucide-react"

interface AchievementShareProps {
  achievement: {
    id: string
    name: string
    description: string
    unlocked: boolean
    icon: string
    secret?: boolean
  }
  variant?: "default" | "minimal"
}

export function AchievementShare({ achievement, variant = "default" }: AchievementShareProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!achievement.unlocked) {
    return null
  }

  const shareContent = formatAchievementForSharing(achievement.name, achievement.description)

  if (variant === "minimal") {
    return <ShareButton content={shareContent} variant="ghost" size="icon" iconOnly />
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Achievement</DialogTitle>
          <DialogDescription>
            Share your "{achievement.name}" achievement with friends and on social media.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center justify-center p-4 bg-gray-900 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center">
                <Award className="h-8 w-8 text-black" />
              </div>
              <h3 className="text-lg font-bold text-yellow-400">{achievement.name}</h3>
              <p className="text-sm text-center text-gray-300">{achievement.description}</p>
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
