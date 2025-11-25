'use client'

import { useState } from 'react'
import { Sun, Moon, Lightbulb, Zap, Contrast, Eye } from 'lucide-react'
import { Button } from './ui/Button'
import { Slider } from './ui/Slider'
import { Select } from './ui/Select'

interface Light {
  id: string
  type: 'ambient' | 'directional' | 'point' | 'spot'
  intensity: number
  color: string
  position?: { x: number; y: number; z: number }
  enabled: boolean
}

export function LightingEditor() {
  const [lights, setLights] = useState<Light[]>([
    {
      id: '1',
      type: 'ambient',
      intensity: 0.5,
      color: '#ffffff',
      enabled: true
    },
    {
      id: '2',
      type: 'directional',
      intensity: 1.0,
      color: '#ffffff',
      position: { x: 10, y: 10, z: 5 },
      enabled: true
    },
    {
      id: '3',
      type: 'point',
      intensity: 0.8,
      color: '#ffeb3b',
      position: { x: -5, y: 5, z: 5 },
      enabled: false
    }
  ])

  const [selectedLight, setSelectedLight] = useState(0)
  const currentLight = lights[selectedLight]

  const updateLight = (property: keyof Light, value: any) => {
    const updatedLights = [...lights]
    updatedLights[selectedLight] = {
      ...currentLight,
      [property]: value
    }
    setLights(updatedLights)
  }

  const updatePosition = (axis: 'x' | 'y' | 'z', value: number) => {
    const updatedLights = [...lights]
    updatedLights[selectedLight] = {
      ...currentLight,
      position: {
        ...currentLight.position,
        [axis]: value
      }
    }
    setLights(updatedLights)
  }

  const lightingPresets = [
    { name: 'Studio', icon: Lightbulb },
    { name: 'Sunset', icon: Sun },
    { name: 'Night', icon: Moon },
    { name: 'Dramatic', icon: Zap },
  ]

  const applyPreset = (presetName: string) => {
    // Apply lighting preset logic
    console.log(`Applying ${presetName} preset`)
  }

  return (
    <div className="space-y-6">
      {/* Lighting Presets */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Lighting Presets</h4>
        <div className="grid grid-cols-2 gap-2">
          {lightingPresets.map((preset) => {
            const Icon = preset.icon
            return (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset.name)}
                className="text-xs"
              >
                <Icon className="w-3 h-3 mr-2" />
                {preset.name}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Light List */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Lights</h4>
        <div className="space-y-2">
          {lights.map((light, index) => (
            <div
              key={light.id}
              className={`p-3 rounded-lg border cursor-pointer ${
                selectedLight === index
                  ? 'border-purple-500 bg-purple-600/10'
                  : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedLight(index)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white capitalize">
                    {light.type} Light
                  </div>
                  <div className="text-xs text-gray-400">
                    Intensity: {light.intensity}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    updateLight('enabled', !light.enabled)
                  }}
                  className={`w-8 h-4 rounded-full transition-colors ${
                    light.enabled ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-3 h-3 bg-white rounded-full transition-transform ${
                      light.enabled ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Light Properties */}
      {currentLight && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-white mb-3">Light Properties</h4>
            
            {/* Color */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block">Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={currentLight.color}
                  onChange={(e) => updateLight('color', e.target.value)}
                  className="w-12 h-8 rounded border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  value={currentLight.color}
                  onChange={(e) => updateLight('color', e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Intensity */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block">Intensity</label>
              <div className="space-y-2">
                <Slider
                  min={0}
                  max={3}
                  step={0.1}
                  value={currentLight.intensity}
                  onValueChange={(value) => updateLight('intensity', value)}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0</span>
                  <span>{currentLight.intensity.toFixed(1)}</span>
                  <span>3.0</span>
                </div>
              </div>
            </div>

            {/* Position (for directional, point, spot lights) */}
            {currentLight.position && (
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block">Position</label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">X</label>
                    <Slider
                      min={-20}
                      max={20}
                      step={0.5}
                      value={currentLight.position.x}
                      onValueChange={(value) => updatePosition('x', value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Y</label>
                    <Slider
                      min={-20}
                      max={20}
                      step={0.5}
                      value={currentLight.position.y}
                      onValueChange={(value) => updatePosition('y', value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Z</label>
                    <Slider
                      min={-20}
                      max={20}
                      step={0.5}
                      value={currentLight.position.z}
                      onValueChange={(value) => updatePosition('z', value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Environment */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Environment</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Environment Map</label>
            <Select value="studio">
              <option value="studio">Studio</option>
              <option value="sunset">Sunset</option>
              <option value="dawn">Dawn</option>
              <option value="night">Night</option>
              <option value="warehouse">Warehouse</option>
              <option value="forest">Forest</option>
            </Select>
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Exposure</label>
            <div className="space-y-2">
              <Slider min={0} max={2} step={0.1} defaultValue={1} />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>1.0</span>
                <span>2.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shadows */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Shadows</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Enable Shadows</span>
            <button className="w-10 h-6 rounded-full bg-purple-600">
              <div className="w-4 h-4 bg-white rounded-full translate-x-5" />
            </button>
          </div>
          
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Shadow Quality</label>
            <Select value="medium">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="ultra">Ultra</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
