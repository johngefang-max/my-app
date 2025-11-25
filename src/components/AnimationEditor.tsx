import { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Slider } from './ui/Slider'
import { Select } from './ui/Select'
 

interface AnimationClip {
  id: string
  name: string
  duration: number
  tracks: any[]
}

interface AnimationEditorProps {
  modelUrl: string
  onAnimationUpdate?: (animationData: any) => void
}

export function AnimationEditor({ modelUrl, onAnimationUpdate }: AnimationEditorProps) {
  const [animations, setAnimations] = useState<AnimationClip[]>([])
  const [selectedAnimation, setSelectedAnimation] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isLoop, setIsLoop] = useState(false)

  useEffect(() => {
    // Load animations from model
    loadAnimations()
  }, [modelUrl])

  const loadAnimations = async () => {
    // This would typically load animations from the 3D model file
    // For now, we'll create some sample animation data
    const sampleAnimations: AnimationClip[] = [
      {
        id: 'idle',
        name: 'Idle Animation',
        duration: 2.0,
        tracks: []
      },
      {
        id: 'walk',
        name: 'Walk Cycle',
        duration: 1.5,
        tracks: []
      },
      {
        id: 'run',
        name: 'Running',
        duration: 0.8,
        tracks: []
      }
    ]
    setAnimations(sampleAnimations)
    if (sampleAnimations.length > 0) {
      setSelectedAnimation(sampleAnimations[0].id)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleAnimationSelect = (animationId: string) => {
    setSelectedAnimation(animationId)
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const handleTimeChange = (time: number) => {
    setCurrentTime(time)
    if (onAnimationUpdate) {
      onAnimationUpdate({
        animationId: selectedAnimation,
        currentTime: time,
        isPlaying
      })
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
  }

  const handleLoopToggle = () => {
    setIsLoop(!isLoop)
  }

  const currentAnimation = animations.find(anim => anim.id === selectedAnimation)

  return (
    <div className="space-y-6">
      {/* Animation Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Animation Clip</h3>
        <Select
          value={selectedAnimation}
          onChange={(e) => handleAnimationSelect((e.target as HTMLSelectElement).value)}
        >
          {animations.map(anim => (
            <option key={anim.id} value={anim.id}>{`${anim.name} (${anim.duration}s)`}</option>
          ))}
        </Select>
      </div>

      {/* Playback Controls */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Playback Controls</h3>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlayPause}
            variant="secondary"
            size="sm"
            className="w-20"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            onClick={handleStop}
            variant="secondary"
            size="sm"
            className="w-20"
          >
            Stop
          </Button>
          
          <Button
            onClick={handleLoopToggle}
            variant={isLoop ? 'primary' : 'secondary'}
            size="sm"
            className="w-20"
          >
            Loop
          </Button>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Time: {currentTime.toFixed(2)}s</span>
            <span>Duration: {currentAnimation?.duration.toFixed(2)}s</span>
          </div>
          
          <Slider
            value={currentTime}
            onValueChange={handleTimeChange}
            min={0}
            max={currentAnimation?.duration || 1}
            step={0.01}
            className="w-full"
          />
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-300">Playback Speed</label>
            <span className="text-sm text-gray-400">{playbackSpeed}x</span>
          </div>
          
          <Slider
            value={playbackSpeed}
            onValueChange={handleSpeedChange}
            min={0.1}
            max={3}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>

      {/* Animation Properties */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Animation Properties</h3>
        
        {currentAnimation && (
          <div className="space-y-3 p-3 bg-gray-800 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Name:</span>
              <span className="text-gray-200">{currentAnimation.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Duration:</span>
              <span className="text-gray-200">{currentAnimation.duration}s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tracks:</span>
              <span className="text-gray-200">{currentAnimation.tracks.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Keyframe Editor (Placeholder) */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Keyframe Editor</h3>
        <div className="p-4 bg-gray-800 rounded-lg border-2 border-dashed border-gray-600">
          <p className="text-sm text-gray-400 text-center">
            Keyframe editor coming soon...
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Add, edit, and manage animation keyframes
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-300">Export Options</h3>
        <div className="space-y-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => console.log('Export animation data')}
          >
            Export Animation Data
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => console.log('Bake animation')}
          >
            Bake to Keyframes
          </Button>
        </div>
      </div>
    </div>
  )
}
