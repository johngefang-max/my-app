'use client'

import { EnhancedModelViewer } from '@/components/EnhancedModelViewer'

interface Model3DViewerProps {
  modelUrl: string
  className?: string
}

export function Model3DViewer({ modelUrl, className = '' }: Model3DViewerProps) {
  return (
    <div className={`relative w-full h-full min-h-[50vh] bg-gray-900 ${className}`}>
      <EnhancedModelViewer src={modelUrl} className="w-full h-[60vh] sm:h-[70vh]" />
    </div>
  )
}
