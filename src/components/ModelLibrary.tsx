'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Search, Filter, Grid, List, Download, Share2, Edit, Trash2, Eye, Heart } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { Model, ModelFile } from '@/lib/supabase'
import Link from 'next/link'

interface ModelLibraryProps {
  userId?: string
  showFilters?: boolean
  showActions?: boolean
  layout?: 'grid' | 'list'
}

export function ModelLibrary({ 
  userId, 
  showFilters = true, 
  showActions = true, 
  layout = 'grid' 
}: ModelLibraryProps) {
  const { user } = useStore()
  const [models, setModels] = useState<Model[]>([])
  const [modelFiles, setModelFiles] = useState<Record<string, ModelFile[]>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>(layout)
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set())

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'character', label: 'Characters' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'vehicle', label: 'Vehicles' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'animal', label: 'Animals' },
    { value: 'nature', label: 'Nature' },
    { value: 'other', label: 'Other' },
  ]

  const sortOptions = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'view_count', label: 'Most Viewed' },
    { value: 'like_count', label: 'Most Liked' },
    { value: 'download_count', label: 'Most Downloaded' },
  ]

  useEffect(() => {
    fetchModels()
  }, [userId, user?.id])

  const fetchModels = async () => {
    try {
      setLoading(true)
      
      // Build query based on userId (show user's models or all public models)
      let query = supabase
        .from('models')
        .select(`
          *,
          model_files (*)
        `)
        .order(sortBy, { ascending: sortBy === 'title' })

      if (userId) {
        // Show specific user's models
        query = query.eq('user_id', userId)
      } else {
        // Show public models or current user's models
        query = query.or(`is_public.eq.true,user_id.eq.${user?.id || 'null'}`)
      }

      const { data, error } = await query

      if (error) throw error

      setModels(data || [])
      
      // Organize model files by model ID
      const filesByModel: Record<string, ModelFile[]> = {}
      data?.forEach(model => {
        filesByModel[model.id] = model.model_files || []
      })
      setModelFiles(filesByModel)
      
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredModels = models.filter(model => {
    const matchesSearch = searchTerm === '' || 
      model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || 
      model.tags?.includes(selectedCategory)
    
    return matchesSearch && matchesCategory
  })

  const handleDelete = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return

    try {
      // Delete model files first
      const { error: filesError } = await supabase
        .from('model_files')
        .delete()
        .eq('model_id', modelId)

      if (filesError) throw filesError

      // Delete model
      const { error: modelError } = await supabase
        .from('models')
        .delete()
        .eq('id', modelId)
        .eq('user_id', user?.id || '')

      if (modelError) throw modelError

      // Refresh models list
      fetchModels()
      
    } catch (error) {
      console.error('Error deleting model:', error)
      alert('Failed to delete model')
    }
  }

  const toggleModelSelection = (modelId: string) => {
    const newSelection = new Set(selectedModels)
    if (newSelection.has(modelId)) {
      newSelection.delete(modelId)
    } else {
      newSelection.add(modelId)
    }
    setSelectedModels(newSelection)
  }

  const handleBulkDelete = async () => {
    if (selectedModels.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedModels.size} models?`)) return

    try {
      const modelIds = Array.from(selectedModels)
      
      // Delete model files first
      const { error: filesError } = await supabase
        .from('model_files')
        .delete()
        .in('model_id', modelIds)

      if (filesError) throw filesError

      // Delete models
      const { error: modelsError } = await supabase
        .from('models')
        .delete()
        .in('id', modelIds)
        .eq('user_id', user?.id || '')

      if (modelsError) throw modelsError

      setSelectedModels(new Set())
      fetchModels()
      
    } catch (error) {
      console.error('Error bulk deleting models:', error)
      alert('Failed to delete models')
    }
  }

  const getPrimaryFileUrl = (modelId: string): string | null => {
    const files = modelFiles[modelId] || []
    const primaryFile = files.find(file => file.is_primary)
    return primaryFile?.file_url || files[0]?.file_url || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading models...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">
              {userId ? 'My Models' : 'Model Library'}
            </h2>
            <span className="text-gray-400">
              {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              options={categories}
              className="bg-gray-700 border-gray-600 text-white"
            />
            
            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={setSortBy}
              options={sortOptions}
              className="bg-gray-700 border-gray-600 text-white"
            />
            
            {/* View Toggle */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-2 rounded ${viewLayout === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout('list')}
                className={`p-2 rounded ${viewLayout === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedModels.size > 0 && (
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 border border-gray-700">
          <span className="text-white">
            {selectedModels.size} model{selectedModels.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-2">
            <Button
              onClick={handleBulkDelete}
              variant="secondary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
            <Button
              onClick={() => setSelectedModels(new Set())}
              variant="ghost"
              size="sm"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Models Grid/List */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No models found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by creating your first 3D model'
            }
          </p>
          {!userId && (
            <Button variant="primary">
              Create Model
            </Button>
          )}
        </div>
      ) : (
        <div className={viewLayout === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredModels.map((model) => {
            const primaryFileUrl = getPrimaryFileUrl(model.id)
            const isSelected = selectedModels.has(model.id)
            
            if (viewLayout === 'grid') {
              return (
                <div
                  key={model.id}
                  className={`bg-gray-800 rounded-lg border ${isSelected ? 'border-purple-500' : 'border-gray-700'} hover:border-purple-400 transition-all group`}
                >
                  {/* Model Preview */}
                  <div className="aspect-square bg-gray-700 rounded-t-lg overflow-hidden relative">
                    {primaryFileUrl ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="bg-purple-600 w-16 h-16 rounded-lg flex items-center justify-center">
                          <div className="bg-white w-8 h-8 rounded"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="bg-gray-600 w-16 h-16 rounded-lg flex items-center justify-center">
                          <div className="bg-gray-400 w-8 h-8 rounded"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Selection Checkbox */}
                    {showActions && (
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleModelSelection(model.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                        />
                      </div>
                    )}
                    
                    {/* Stats Overlay */}
                    <div className="absolute bottom-2 right-2 flex space-x-2">
                      <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1 flex items-center space-x-1">
                        <Eye className="w-3 h-3 text-gray-300" />
                        <span className="text-xs text-gray-300">{model.view_count || 0}</span>
                      </div>
                      <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1 flex items-center space-x-1">
                        <Heart className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-gray-300">{model.like_count || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Model Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white truncate flex-1">
                        {model.title}
                      </h3>
                      {model.is_public && (
                        <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded ml-2">
                          Public
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {model.description || 'No description available'}
                    </p>
                    
                    {/* Tags */}
                    {model.tags && model.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {model.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {model.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{model.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Actions */}
                    {showActions && (
                      <div className="flex space-x-2">
                        <Link
                          href={`/gallery/${model.id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        
                        {user?.id === model.user_id && (
                          <>
                            <Link
                              href={`/editor/${model.id}`}
                              className="flex-1"
                            >
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            
                            <Button
                              onClick={() => handleDelete(model.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            } else {
              // List view
              return (
                <div
                  key={model.id}
                  className={`bg-gray-800 rounded-lg border ${isSelected ? 'border-purple-500' : 'border-gray-700'} p-4 hover:border-purple-400 transition-all`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Selection Checkbox */}
                    {showActions && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleModelSelection(model.id)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                      />
                    )}
                    
                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      {primaryFileUrl ? (
                        <div className="bg-purple-600 w-10 h-10 rounded flex items-center justify_center">
                          <div className="bg-white w-5 h-5 rounded"></div>
                        </div>
                      ) : (
                        <div className="bg-gray-600 w-10 h-10 rounded flex items-center justify-center">
                          <div className="bg-gray-400 w-5 h-5 rounded"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Model Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-white truncate">
                          {model.title}
                        </h3>
                        {model.is_public && (
                          <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                            Public
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        {model.description || 'No description available'}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{model.view_count || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{model.like_count || 0}</span>
                        </div>
                        <div className="text-gray-400">
                          {new Date(model.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {showActions && (
                      <div className="flex items-center space-x-2">
                        <Link href={`/gallery/${model.id}`}>
                          <Button
                            variant="primary"
                            size="sm"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </Link>
                        
                        {user?.id === model.user_id && (
                          <>
                            <Link href={`/editor/${model.id}`}>
                              <Button
                                variant="secondary"
                                size="sm"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            
                            <Button
                              onClick={() => handleDelete(model.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            }
          })}
        </div>
      )}
    </div>
  )
}
