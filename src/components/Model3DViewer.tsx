'use client'

import { ThreeModelViewer } from '@/components/ThreeModelViewer'

interface Model3DViewerProps {
  modelUrl: string
  className?: string
}

export function Model3DViewer({ modelUrl, className = '' }: Model3DViewerProps) {
  return (
    <div className={`relative w-full h-full min-h-[50vh] bg-gray-900 ${className}`}>
      <ThreeModelViewer
        modelUrl={modelUrl}
        className="w-full h-[60vh] sm:h-[70vh]"
        autoRotate={true}
        environment="city"
        showGrid={true}
        shadows={true}
      />
    </div>
  )
}
