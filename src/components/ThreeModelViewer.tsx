'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// 动态导入整个ThreeModelViewer组件，禁用SSR
const ThreeViewer = dynamic(() => import('./ThreeViewerImpl').then(mod => ({ default: mod.ThreeViewer })), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-white">加载中...</div>
})

interface ThreeModelViewerProps {
  modelUrl: string
  className?: string
  autoRotate?: boolean
  environment?: string
  backgroundColor?: string
  showGrid?: boolean
  shadows?: boolean
}

export function ThreeModelViewer({
  modelUrl,
  className = '',
  autoRotate = true,
  environment = 'city',
  backgroundColor = '#0f172a',
  showGrid = true,
  shadows = true
}: ThreeModelViewerProps) {
  if (!modelUrl) {
    return (
      <div className={`w-full h-full flex items-center justify-center text-white ${className}`} style={{ background: backgroundColor }}>
        <div className="text-center">
          <div className="text-xl mb-2">🎨</div>
          <p>请选择3D模型文件</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full ${className}`} style={{ background: backgroundColor }}>
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white">加载中...</div>}>
        <ThreeViewer
          modelUrl={modelUrl}
          autoRotate={autoRotate}
          environment={environment}
          showGrid={showGrid}
          shadows={shadows}
        />
      </Suspense>

      {/* 控制提示 */}
      <div className="absolute bottom-4 right-4 text-white text-xs bg-black/50 px-3 py-2 rounded-lg">
        <div>🖱️ 左键拖拽: 旋转 | 滚轮: 缩放 | 右键拖拽: 平移</div>
      </div>
    </div>
  )
}