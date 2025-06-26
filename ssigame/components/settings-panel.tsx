"use client"

import { useState, useEffect } from "react"
import { gameState } from "@/game-state"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Volume2, VolumeX, Gamepad2, Vibrate, Share2, Fullscreen } from "lucide-react"
import { isMobileDevice } from "@/utils"

export function SettingsPanel() {
  const [settings, setSettings] = useState(gameState.getSettings())
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    // Set up fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const updateSettings = (newSettings: any) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    gameState.updateSettings(updatedSettings)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Game Settings</CardTitle>
        <CardDescription>Customize your S.S.I. experience</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="audio">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="gameplay">Gameplay</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <Label htmlFor="sound-toggle">Sound Effects</Label>
                </div>
                <Switch
                  id="sound-toggle"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="sound-volume">Sound Volume</Label>
                  <span className="text-sm text-gray-400">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <Slider
                  id="sound-volume"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[settings.soundVolume]}
                  onValueChange={(value) => updateSettings({ soundVolume: value[0] })}
                  disabled={!settings.soundEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {settings.musicEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <Label htmlFor="music-toggle">Music</Label>
                </div>
                <Switch
                  id="music-toggle"
                  checked={settings.musicEnabled}
                  onCheckedChange={(checked) => updateSettings({ musicEnabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="music-volume">Music Volume</Label>
                  <span className="text-sm text-gray-400">{Math.round(settings.musicVolume * 100)}%</span>
                </div>
                <Slider
                  id="music-volume"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[settings.musicVolume]}
                  onValueChange={(value) => updateSettings({ musicVolume: value[0] })}
                  disabled={!settings.musicEnabled}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gameplay" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="difficulty" className="mb-2 block">
                  Difficulty
                </Label>
                <div className="flex space-x-2">
                  {["easy", "normal", "hard"].map((diff) => (
                    <Button
                      key={diff}
                      id={`difficulty-${diff}`}
                      onClick={() => updateSettings({ difficulty: diff })}
                      variant={settings.difficulty === diff ? "default" : "outline"}
                      className="flex-1"
                    >
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {isMobileDevice() && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Vibrate className="h-4 w-4" />
                    <Label htmlFor="vibration-toggle">Vibration</Label>
                  </div>
                  <Switch
                    id="vibration-toggle"
                    checked={settings.vibrationEnabled}
                    onCheckedChange={(checked) => updateSettings({ vibrationEnabled: checked })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Share2 className="h-4 w-4" />
                  <Label htmlFor="auto-share-toggle">Auto-share Achievements</Label>
                </div>
                <Switch
                  id="auto-share-toggle"
                  checked={settings.autoShareAchievements || false}
                  onCheckedChange={(checked) => updateSettings({ autoShareAchievements: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4 pt-4">
            <div className="space-y-4">
              <Button onClick={toggleFullscreen} className="w-full">
                <Fullscreen className="mr-2 h-4 w-4" />
                {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
