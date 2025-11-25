'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Model3DViewer } from '@/components/Model3DViewer'
import { MaterialEditor } from '@/components/MaterialEditor'
import { LightingEditor } from '@/components/LightingEditor'
import { AnimationEditor } from '@/components/AnimationEditor'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Save, Download, Share2, RotateCcw } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { Model, ModelFile } from '@/lib/supabase'

export default function ModelEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { setCurrentModel, setCurrentModelFile, editorMode } = useStore()
  const [model, setModel] = useState<Model | null>(null)
  const [modelFile, setModelFile] = useState<ModelFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('material')

  useEffect(() => {
    fetchModelData()
  }, [params.id])

  const fetchModelData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch model data
      const { data: modelData, error: modelError } = await supabase
        .from('models')
        .select(`
          *,
          model_files (*)
        `)
        .eq('id', params.id as string)
        .single()

      if (modelError) throw modelError
      if (!modelData) throw new Error('Model not found')

      setModel(modelData)
      setCurrentModel(modelData)

      // Get primary model file or first available file
      const primaryFile = modelData.model_files?.find((file: ModelFile) => file.is_primary) || 
                         modelData.model_files?.[0]
      
      if (primaryFile) {
        setModelFile(primaryFile)
        setCurrentModelFile(primaryFile)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (!model) return

      // Save model changes (title, description, tags, etc.)
      const { error } = await supabase
        .from('models')
        .update({
          title: model.title,
          description: model.description,
          tags: model.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', model.id)

      if (error) throw error
      
      alert('Model saved successfully!')
    } catch (err) {
      console.error('Save failed:', err)
      alert('Failed to save model')
    }
  }

  const handleExport = async (format: 'glb' | 'obj' | 'fbx') => {
    if (!modelFile) return

    try {
      const link = document.createElement('a')
      link.href = modelFile.file_url
      link.download = `${model?.title || 'model'}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Track export
      if (model) {
        await supabase
          .from('models')
          .update({ download_count: (model.download_count || 0) + 1 })
          .eq('id', model.id)
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      fetchModelData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading model...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/gallery')}>
            Back to Gallery
          </Button>
        </div>
      </div>
    )
  }

  if (!model || !modelFile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-2">Model not found</h2>
          <Button onClick={() => router.push('/gallery')}>
            Back to Gallery
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* 3D Editor Viewport */}
      <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
        <Model3DViewer modelUrl={modelFile.file_url} />
        
        {/* Editor Toolbar - Mobile optimized */}
        <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex gap-1 sm:gap-2">
            <Button
              onClick={handleSave}
              variant="primary"
              size="sm"
              className="bg-cyan-600/80 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm"
            >
              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Save</span>
              <span className="sm:hidden">S</span>
            </Button>
            <Button
              onClick={handleReset}
              variant="secondary"
              size="sm"
              className="bg-gray-800/80 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
              <span className="sm:hidden">R</span>
            </Button>
          </div>
          
          <div className="flex gap-1 sm:gap-2 flex-wrap">
            <Button
              onClick={() => handleExport('glb')}
              variant="secondary"
              size="sm"
              className="bg-gray-800/80 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">GLB</span>
              <span className="sm:hidden">G</span>
            </Button>
            <Button
              onClick={() => handleExport('obj')}
              variant="secondary"
              size="sm"
              className="bg-gray-800/80 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">OBJ</span>
              <span className="sm:hidden">O</span>
            </Button>
            <Button
              onClick={() => handleExport('fbx')}
              variant="secondary"
              size="sm"
              className="bg-gray-800/80 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">FBX</span>
              <span className="sm:hidden">F</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Editor Tools - Responsive */}
      <div className="w-full lg:w-96 bg-gray-800 border-l-0 lg:border-l border-gray-700 overflow-y-auto">
        <div className="p-3 sm:p-6">
          {/* Model Info Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">{model.title}</h1>
            <p className="text-gray-400 text-xs sm:text-sm">{model.description}</p>
          </div>

          {/* Editor Tabs - Responsive */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-3 sm:mb-6 text-xs sm:text-sm">
              <TabsTrigger value="material">Material</TabsTrigger>
              <TabsTrigger value="lighting">Lighting</TabsTrigger>
              <TabsTrigger value="animation">Animation</TabsTrigger>
            </TabsList>

            <TabsContent value="material">
              <MaterialEditor />
            </TabsContent>

            <TabsContent value="lighting">
              <LightingEditor />
            </TabsContent>

            <TabsContent value="animation">
              <AnimationEditor modelUrl={modelFile.file_url} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}