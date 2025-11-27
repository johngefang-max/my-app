'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ModelCard } from '@/components/ModelCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Search, Filter, Plus, Grid, List, Download, Eye } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { Model } from '@/lib/supabase'

export default function GalleryPage() {
  const router = useRouter()
  const { user } = useStore()
  const [models, setModels] = useState<Model[]>([])
  const [filteredModels, setFilteredModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'character', label: 'Characters' },
    { value: 'vehicle', label: 'Vehicles' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'nature', label: 'Nature' },
    { value: 'props', label: 'Props' },
    { value: 'weapons', label: 'Weapons' },
    { value: 'furniture', label: 'Furniture' }
  ]

  const sortOptions = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'view_count', label: 'Most Viewed' },
    { value: 'download_count', label: 'Most Downloaded' },
    
  ]

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    filterModels()
  }, [models, searchTerm, selectedCategory, sortBy])

  const fetchModels = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('models')
        .select(`
          *,
          model_files (*),
          user:users!models_user_id_fkey(id, username, avatar_url)
        `)
        .order('created_at', { ascending: false })

      // If user is logged in, also fetch their private models
      if (user) {
        query = query.or(`visibility.eq.public,and(user_id.eq.${user.id},visibility.eq.private)`)
      } else {
        query = query.eq('visibility', 'public')
      }

      const { data, error } = await query

      if (error) throw error
      
      setModels(data || [])
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterModels = () => {
    let filtered = [...models]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(model =>
        model.tags?.includes(selectedCategory)
      )
    }

    // Sort models
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'view_count':
          return (b.view_count || 0) - (a.view_count || 0)
        case 'download_count':
          return (b.download_count || 0) - (a.download_count || 0)
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredModels(filtered)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleCreateNew = () => {
    if (!user) {
      alert('Please log in to create new models')
      return
    }
    router.push('/generator')
  }

  const handleModelClick = (modelId: string) => {
    router.push(`/gallery/${modelId}`)
  }

  const handleModelEdit = (modelId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      alert('Please log in to edit models')
      return
    }
    router.push(`/editor/${modelId}`)
  }

  const handleModelDownload = (model: any, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const primaryFile = model.model_files?.find((file: any) => file.is_primary) || 
                        model.model_files?.[0]
    
    if (primaryFile) {
      const link = document.createElement('a')
      link.href = primaryFile.file_url
      link.download = `${model.title}.${primaryFile.file_format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Track download
      supabase
        .from('models')
        .update({ download_count: (model.download_count || 0) + 1 })
        .eq('id', model.id)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading models...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">3D Model Gallery</h1>
              <p className="text-gray-400 text-sm sm:text-base">
                Discover and download high-quality 3D models created by our community
              </p>
            </div>
            
            <Button
              onClick={handleCreateNew}
              variant="primary"
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Model
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => handleSearchChange((e.target as HTMLInputElement).value)}
                className="pl-10 w-full text-sm sm:text-base"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-2 sm:px-3"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-2 sm:px-3"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="px-2 sm:px-3"
              >
                <Filter className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>

          {/* Filter Options - Responsive */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-800 rounded-lg">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory((e.target as HTMLSelectElement).value)}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy((e.target as HTMLSelectElement).value)}
                >
                  {sortOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSortBy('created_at')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-4 sm:mb-6">
          <p className="text-gray-400 text-sm sm:text-base">
            Showing {filteredModels.length} of {models.length} models
          </p>
        </div>

        {/* Models Grid/List - Responsive */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
              <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">No models found</h3>
              <p className="text-sm sm:text-base">Try adjusting your search terms or filters</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="text-sm sm:text-base"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            : "space-y-3 sm:space-y-4"
          }>
            {filteredModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                viewMode={viewMode}
                onClick={() => handleModelClick(model.id)}
                onEdit={(e) => handleModelEdit(model.id, e)}
                onDownload={(e) => handleModelDownload(model, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
