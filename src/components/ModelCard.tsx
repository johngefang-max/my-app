import { useState } from 'react'
import { Download, Edit, Eye, Heart, Share2, User, Calendar, FileText } from 'lucide-react'
import { Button } from './ui/Button'
import { Model } from '@/lib/supabase'
import Image from 'next/image'

interface ModelCardProps {
  model: Model
  viewMode: 'grid' | 'list'
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
  onDownload: (e: React.MouseEvent) => void
}

export function ModelCard({ model, viewMode, onClick, onEdit, onDownload }: ModelCardProps) {
  const [imageError, setImageError] = useState(false)
  
  const primaryFile = model.model_files?.find((file: any) => file.is_primary) || 
                     model.model_files?.[0]
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4 hover:bg-gray-750 transition-colors cursor-pointer"
           onClick={onClick}>
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Thumbnail */}
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
            {!imageError && model.thumbnail_url ? (
              <Image
                src={model.thumbnail_url}
                alt={model.title}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
              </div>
            )}
          </div>

          {/* Model Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white truncate">{model.title}</h3>
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-1 sm:mb-2">{model.description}</p>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{model.user?.username || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(model.created_at)}</span>
              </div>
              {primaryFile && (
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{formatFileSize(primaryFile.file_size)}</span>
                </div>
              )}
            </div>

            {/* Tags - Hidden on very small screens */}
            {model.tags && model.tags.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1 mt-2">
                {model.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {model.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                    +{model.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats - Hidden on very small screens */}
          <div className="hidden sm:flex flex-col items-end gap-2 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{model.view_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{model.download_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{model.like_count || 0}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={onEdit}
              className="bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={onDownload}
              className="bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer"
         onClick={onClick}>
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-700 relative overflow-hidden">
        {!imageError && model.thumbnail_url ? (
          <Image
            src={model.thumbnail_url}
            alt={model.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500" />
          </div>
        )}
        
        {/* Overlay Actions - Responsive */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex gap-1 sm:gap-2">
            <Button
              variant="secondary"
              size="xs"
              onClick={onEdit}
              className="bg-gray-800 bg-opacity-80 hover:bg-gray-700 px-2 py-1 text-xs"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={onDownload}
              className="bg-gray-800 bg-opacity-80 hover:bg-gray-700 px-2 py-1 text-xs"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* Category Badge - Responsive */}
        {model.category && (
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-purple-600 text_white text-xs rounded-full">
              {model.category}
            </span>
          </div>
        )}
      </div>

      {/* Model Info - Responsive */}
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-1 line-clamp-1">{model.title}</h3>
        <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{model.description}</p>
        
        {/* Author - Hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-1 mb-2 sm:mb-3 text-sm text-gray-500">
          <User className="w-3 h-3" />
          <span>{model.user?.username || 'Anonymous'}</span>
        </div>

        {/* Stats - Responsive */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{model.view_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{model.download_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{model.like_count || 0}</span>
            </div>
          </div>
          
          {primaryFile && (
            <span className="text-xs text-gray-500">
              {formatFileSize(primaryFile.file_size)}
            </span>
          )}
        </div>

        {/* Tags - Responsive */}
        {model.tags && model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
            {model.tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-700 text-gray-300 text-xs rounded">
                {tag}
              </span>
            ))}
            {model.tags.length > 2 && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-700 text-gray-300 text-xs rounded">
                +{model.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
