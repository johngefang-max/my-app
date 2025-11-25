'use client'

import { useStore } from '@/store/useStore'
import { 
  Eye, 
  Grid3x3, 
  Axis3D, 
  Palette, 
  Sun,
  Moon,
  Lightbulb,
  Zap
} from 'lucide-react'
import { Button } from './ui/Button'
import { Slider } from './ui/Slider'
import { Select } from './ui/Select'

export function ModelControls() {
  const { viewerSettings, setViewerSettings } = useStore()

  const lightingPresets = [
    { value: 'studio', label: 'Studio' },
    { value: 'sunset', label: 'Sunset' },
    { value: 'dawn', label: 'Dawn' },
    { value: 'night', label: 'Night' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'forest', label: 'Forest' },
    { value: 'apartment', label: 'Apartment' },
  ]

  const backgroundColors = [
    { value: '#1a1a1a', label: 'Dark' },
    { value: '#ffffff', label: 'White' },
    { value: '#f3f4f6', label: 'Light Gray' },
    { value: '#374151', label: 'Gray' },
    { value: '#000000', label: 'Black' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">View Controls</h3>
        
        {/* Display Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Wireframe</span>
            </div>
            <button
              onClick={() => setViewerSettings({ wireframe: !viewerSettings.wireframe })}
              className={`w-10 h-6 rounded-full transition-colors ${
                viewerSettings.wireframe ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  viewerSettings.wireframe ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Show Grid</span>
            </div>
            <button
              onClick={() => setViewerSettings({ showGrid: !viewerSettings.showGrid })}
              className={`w-10 h-6 rounded-full transition-colors ${
                viewerSettings.showGrid ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  viewerSettings.showGrid ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Axis3D className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Show Axes</span>
            </div>
            <button
              onClick={() => setViewerSettings({ showAxes: !viewerSettings.showAxes })}
              className={`w-10 h-6 rounded-full transition-colors ${
                viewerSettings.showAxes ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  viewerSettings.showAxes ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Background */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Background</h4>
        <Select
          value={viewerSettings.backgroundColor}
          onValueChange={(value) => setViewerSettings({ backgroundColor: value })}
        >
          {backgroundColors.map((color) => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Lighting */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Lighting</h4>
        <Select
          value={viewerSettings.lightingPreset}
          onValueChange={(value) => setViewerSettings({ lightingPreset: value })}
        >
          {lightingPresets.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Export Options */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Export</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            Export as GLB
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Export as OBJ
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Export as FBX
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            Export Screenshot
          </Button>
        </div>
      </div>
    </div>
  )
}