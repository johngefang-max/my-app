'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Model3DViewer } from '@/components/Model3DViewer'
import { ModelControls } from '@/components/ModelControls'
import { ModelInfo } from '@/components/ModelInfo'
import { Button } from '@/components/ui/Button'
import { Download, Share2, Heart, Edit3D } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { Model, ModelFile } from '@/lib/supabase'

export default function ModelPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const { setCurrentModel, setCurrentModelFile } = useStore()
  const [model, setModel] = useState<Model | null>(null)
  const [modelFile, setModelFile] = useState<ModelFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          model_files (
            *,
            users!inner (
              username,
              avatar_url
            )
          )
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

      // Track view
      await trackModelView(params.id as string)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model')
    } finally {
      setLoading(false)
    }
  }

  const trackModelView = async (modelId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      await supabase.from('model_views').insert({
        model_id: modelId,
        user_id: user?.id || null,
        ip_address: null, // Will be handled by RLS/triggers
        metadata: {
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      })

      // Increment view count
      await supabase
        .from('models')
        .update({ view_count: (model?.view_count || 0) + 1 })
        .eq('id', modelId)
    } catch (err) {
      console.error('Failed to track view:', err)
    }
  }

  const handleDownload = async () => {
    if (!modelFile) return

    try {
      const link = document.createElement('a')
      link.href = modelFile.file_url
      link.download = `${model?.title || 'model'}.${modelFile.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Track download
      if (model) {
        await supabase
          .from('models')
          .update({ download_count: (model.download_count || 0) + 1 })
          .eq('id', model.id)
      }
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: model?.title || '3D Model',
          text: model?.description || 'Check out this 3D model',
          url: window.location.href,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleLike = async () => {
    if (!model) return

    try {
      await supabase
        .from('models')
        .update({ like_count: (model.like_count || 0) + 1 })
        .eq('id', model.id)
      
      setModel({ ...model, like_count: (model.like_count || 0) + 1 })
    } catch (err) {
      console.error('Like failed:', err)
    }
  }

  const handleEdit = () => {
    if (model) {
      router.push(`/editor/${model.id}`)
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
      {/* 3D Viewer */}
      <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
        <Model3DViewer modelUrl={modelFile.file_url} />
        
        {/* Action Buttons - Mobile optimized */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-wrap gap-1 sm:gap-2">
          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            className="bg-gray-800/80 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Download</span>
          </Button>
          <Button
            onClick={handleShare}
            variant="secondary"
            size="sm"
            className="bg-gray-800/80 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm"
          >
            <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            onClick={handleLike}
            variant="secondary"
            size="sm"
            className="bg-gray-800/80 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm"
          >
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{model.like_count || 0}</span>
            <span className="sm:hidden">{model.like_count || 0}</span>
          </Button>
          <Button
            onClick={handleEdit}
            variant="primary"
            size="sm"
            className="bg-cyan-600/80 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm"
          >
            <Edit3D className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </div>
      </div>

      {/* Right Panel - Responsive */}
      <div className="w-full lg:w-80 bg-gray-800 border-l-0 lg:border-l border-gray-700 overflow-y-auto">
        <div className="p-4 sm:p-6">
          <ModelInfo model={model} />
          <ModelControls />
        </div>
      </div>
    </div>
  )
}