import { Model } from '@/lib/supabase'
import { User, Calendar, Eye, Download, Heart, Tag } from 'lucide-react'

interface ModelInfoProps {
  model: Model
}

export function ModelInfo({ model }: ModelInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Model Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{model.title}</h1>
        {model.description && (
          <p className="text-gray-300 text-sm leading-relaxed">{model.description}</p>
        )}
      </div>

      {/* Model Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Eye className="w-4 h-4" />
            <span>Views</span>
          </div>
          <div className="text-xl font-semibold text-white">{model.view_count.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Heart className="w-4 h-4" />
            <span>Likes</span>
          </div>
          <div className="text-xl font-semibold text-white">{model.like_count.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Download className="w-4 h-4" />
            <span>Downloads</span>
          </div>
          <div className="text-xl font-semibold text-white">{model.download_count.toLocaleString()}</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            <span>Created</span>
          </div>
          <div className="text-sm font-medium text-white">{formatDate(model.created_at)}</div>
        </div>
      </div>

      {/* Tags */}
      {model.tags && model.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
            <Tag className="w-4 h-4" />
            <span>Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {model.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Processing Status */}
      <div>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <span>Status</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              model.processing_status === 'completed'
                ? 'bg-green-500'
                : model.processing_status === 'processing'
                ? 'bg-yellow-500'
                : model.processing_status === 'failed'
                ? 'bg-red-500'
                : 'bg-gray-500'
            }`}
          />
          <span className="text-sm text-white capitalize">{model.processing_status}</span>
        </div>
      </div>

      {/* Privacy */}
      <div>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <span>Visibility</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              model.is_public ? 'bg-green-500' : 'bg-gray-500'
            }`}
          />
          <span className="text-sm text-white">
            {model.is_public ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
    </div>
  )
}