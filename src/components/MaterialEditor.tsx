'use client'

import { useState } from 'react'
import { Palette, Droplet, Sparkles, Contrast } from 'lucide-react'
import { Button } from './ui/Button'
import { Slider } from './ui/Slider'
import { Select } from './ui/Select'

interface Material {
  name: string
  color: string
  roughness: number
  metalness: number
  emissive: string
  emissiveIntensity: number
}

export function MaterialEditor() {
  const [selectedMaterial, setSelectedMaterial] = useState(0)
  const [materials, setMaterials] = useState<Material[]>([
    {
      name: 'Default Material',
      color: '#ffffff',
      roughness: 0.5,
      metalness: 0.0,
      emissive: '#000000',
      emissiveIntensity: 0.0
    }
  ])

  const currentMaterial = materials[selectedMaterial]

  const updateMaterial = (property: keyof Material, value: string | number) => {
    const updatedMaterials = [...materials]
    updatedMaterials[selectedMaterial] = {
      ...currentMaterial,
      [property]: value
    }
    setMaterials(updatedMaterials)
  }

  const presetMaterials = [
    { name: 'Plastic', color: '#ff6b6b', roughness: 0.8, metalness: 0.0 },
    { name: 'Metal', color: '#4ecdc4', roughness: 0.1, metalness: 1.0 },
    { name: 'Wood', color: '#8b4513', roughness: 0.9, metalness: 0.0 },
    { name: 'Glass', color: '#87ceeb', roughness: 0.0, metalness: 0.0 },
    { name: 'Rubber', color: '#2c2c2c', roughness: 1.0, metalness: 0.0 },
  ]

  const applyPreset = (preset: typeof presetMaterials[0]) => {
    updateMaterial('color', preset.color)
    updateMaterial('roughness', preset.roughness)
    updateMaterial('metalness', preset.metalness)
  }

  return (
    <div className="space-y-6">
      {/* Material Presets */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Material Presets</h4>
        <div className="grid grid-cols-2 gap-2">
          {presetMaterials.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
              className="text-xs"
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: preset.color }}
              />
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Base Color */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Base Color
        </h4>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={currentMaterial.color}
            onChange={(e) => updateMaterial('color', e.target.value)}
            className="w-12 h-8 rounded border border-gray-600 bg-gray-700"
          />
          <input
            type="text"
            value={currentMaterial.color}
            onChange={(e) => updateMaterial('color', e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Roughness */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Droplet className="w-4 h-4" />
          Roughness
        </h4>
        <div className="space-y-2">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={currentMaterial.roughness}
            onValueChange={(value) => updateMaterial('roughness', value)}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Smooth</span>
            <span>{currentMaterial.roughness.toFixed(2)}</span>
            <span>Rough</span>
          </div>
        </div>
      </div>

      {/* Metalness */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Metalness
        </h4>
        <div className="space-y-2">
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={currentMaterial.metalness}
            onValueChange={(value) => updateMaterial('metalness', value)}
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Dielectric</span>
            <span>{currentMaterial.metalness.toFixed(2)}</span>
            <span>Metal</span>
          </div>
        </div>
      </div>

      {/* Emissive */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Contrast className="w-4 h-4" />
          Emissive
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={currentMaterial.emissive}
              onChange={(e) => updateMaterial('emissive', e.target.value)}
              className="w-12 h-8 rounded border border-gray-600 bg-gray-700"
            />
            <input
              type="text"
              value={currentMaterial.emissive}
              onChange={(e) => updateMaterial('emissive', e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Intensity</span>
              <span className="text-gray-400">{currentMaterial.emissiveIntensity.toFixed(2)}</span>
            </div>
            <Slider
              min={0}
              max={2}
              step={0.01}
              value={currentMaterial.emissiveIntensity}
              onValueChange={(value) => updateMaterial('emissiveIntensity', value)}
            />
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <Button variant="primary" className="w-full">
        Apply Material Changes
      </Button>
    </div>
  )
}