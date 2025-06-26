"use client"

import { useState } from "react"
import {
  shareContent,
  copyToClipboard,
  isWebShareAvailable,
  getTwitterShareUrl,
  getFacebookShareUrl,
  getWhatsAppShareUrl,
  getTelegramShareUrl,
  getEmailShareUrl,
} from "@/lib/social-share"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Share2, Copy, Twitter, Facebook, Mail, MessageCircle, Check } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type ShareableContent = {
  title: string
  text: string
  url: string
  hashtags?: string[]
  image?: string
}

interface ShareButtonProps {
  content: ShareableContent
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  iconOnly?: boolean
}

export function ShareButton({
  content,
  variant = "default",
  size = "default",
  className = "",
  iconOnly = false,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // Try to use the Web Share API first
    const shared = await shareContent(content)

    if (shared) {
      toast({
        title: "Shared successfully!",
        description: "Your content has been shared.",
      })
    } else {
      // If Web Share API is not available, open the dropdown
      document.getElementById("share-dropdown-trigger")?.click()
    }
  }

  const handleCopy = async () => {
    const shareText = `${content.title}\n${content.text}\n${content.url}`
    const success = await copyToClipboard(shareText)

    if (success) {
      setCopied(true)
      toast({
        title: "Copied to clipboard!",
        description: "Share link copied to clipboard.",
      })

      setTimeout(() => setCopied(false), 2000)
    } else {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openShareUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400")
  }

  return (
    <div className="inline-block">
      {isWebShareAvailable() ? (
        <Button onClick={handleShare} variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          {!iconOnly && "Share"}
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button id="share-dropdown-trigger" variant={variant} size={size} className={className}>
              <Share2 className="h-4 w-4 mr-2" />
              {!iconOnly && "Share"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShareUrl(getTwitterShareUrl(content))}>
              <Twitter className="h-4 w-4 mr-2" />
              Share on Twitter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShareUrl(getFacebookShareUrl(content))}>
              <Facebook className="h-4 w-4 mr-2" />
              Share on Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShareUrl(getWhatsAppShareUrl(content))}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Share on WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShareUrl(getTelegramShareUrl(content))}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Share on Telegram
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openShareUrl(getEmailShareUrl(content))}>
              <Mail className="h-4 w-4 mr-2" />
              Share via Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
