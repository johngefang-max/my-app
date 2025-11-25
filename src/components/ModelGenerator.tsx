'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Slider } from '@/components/ui/Slider'
import { Model3DViewer } from '@/components/Model3DViewer'
import { Wand2, Download, Share2, Save } from 'lucide-react'
import { useStore } from '@/store/useStore'

interface GeneratedModel {
  id: string
  url: string
  prompt: string
  style: string
  quality: string
  format: string
}

export function ModelGenerator() {
  const { user } = useStore()
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [quality, setQuality] = useState('high')
  const [format, setFormat] = useState('glb')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedModel, setGeneratedModel] = useState<GeneratedModel | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id || 'demo'}`,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          quality,
          format,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setGeneratedModel({
        id: data.modelId,
        url: data.modelUrl,
        prompt: prompt.trim(),
        style,
        quality,
        format,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
      console.error('Generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedModel) return

    try {
      // Save to user's collection
      const response = await fetch('/api/models/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id || 'demo'}`,
        },
        body: JSON.stringify({
          modelId: generatedModel.id,
          title: generatedModel.prompt.slice(0, 50) + (generatedModel.prompt.length > 50 ? '...' : ''),
          description: `AI-generated 3D model from prompt: "${generatedModel.prompt}"`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save model')
      }

      alert('Model saved to your collection!')
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save model')
    }
  }

  const handleDownload = () => {
    if (!generatedModel) return

    const link = document.createElement('a')
    link.href = generatedModel.url
    link.download = `generated-model-${generatedModel.id}.${generatedModel.format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (!generatedModel) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated 3D Model',
          text: `Check out this 3D model I generated: "${generatedModel.prompt}"`,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Share error:', err)
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Generation Controls */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">AI Model Generator</h2>
            <p className="text-gray-400">
              Describe the 3D model you want to create and our AI will generate it for you.
            </p>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic robot with glowing blue eyes, mechanical joints, and sleek metallic armor..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[100px] resize-none"
            />
          </div>

          {/* Generation Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Style
              </label>
              <Select
                value={style}
                onChange={(e) => setStyle((e.target as HTMLSelectElement).value)}
              >
                <option value="realistic">Realistic</option>
                <option value="cartoon">Cartoon</option>
                <option value="low-poly">Low Poly</option>
                <option value="stylized">Stylized</option>
                <option value="anime">Anime</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Quality
              </label>
              <Select
                value={quality}
                onChange={(e) => setQuality((e.target as HTMLSelectElement).value)}
              >
                <option value="low">Low (Fast)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Best)</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Format
              </label>
              <Select
                value={format}
                onChange={(e) => setFormat((e.target as HTMLSelectElement).value)}
              >
                <option value="glb">GLB (Recommended)</option>
                <option value="obj">OBJ</option>
                <option value="fbx">FBX</option>
              </Select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            variant="primary"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate 3D Model
              </>
            )}
          </Button>

          {/* Model Actions */}
          {generatedModel && (
            <div className="space-y-3">
              <div className="text-sm text-gray-400">
                Generated model with prompt: "{generatedModel.prompt}"
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleShare}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 3D Preview */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Preview</h3>
            <p className="text-gray-400">
              Preview your generated 3D model in real-time.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {generatedModel ? (
              <Model3DViewer 
                modelUrl={generatedModel.url}
                className="h-96"
              />
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-gray-700 w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Wand2 className="w-12 h-12 text-gray-500" />
                  </div>
                  <p className="text-gray-400">
                    {isGenerating ? 'Generating your 3D model...' : 'Generate a model to see preview'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Model Info */}
          {generatedModel && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Model Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Style:</span>
                  <span className="text-white capitalize">{generatedModel.style}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quality:</span>
                  <span className="text-white capitalize">{generatedModel.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Format:</span>
                  <span className="text-white uppercase">{generatedModel.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Model ID:</span>
                  <span className="text-gray-300 font-mono text-xs">{generatedModel.id}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
