'use client'

import { useState, useRef, useEffect } from 'react'
import {
  RotateCcw, Play, Pause, Maximize2, Grid, Sun, Moon,
  Camera, Download, Share2, Settings, Eye, EyeOff
} from 'lucide-react'
import Script from 'next/script'

type ModelViewerProps = {
  src?: string
  modelFile?: File
  autoRotate?: boolean
  environment?: string
  backgroundColor?: string
  showGrid?: boolean
  shadows?: boolean
  className?: string
  onModelLoad?: (details: any) => void
}

const ModelViewer: React.FC<ModelViewerProps> = ({
  src,
  modelFile,
  autoRotate = true,
  environment = 'studio',
  backgroundColor = '#0f172a',
  showGrid = true,
  shadows = true,
  className = '',
  onModelLoad
}) => {
  const viewerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelInfo, setModelInfo] = useState<any>(null)

  // 环境预设
  const environmentPresets = {
    studio: 'https://modelviewer.dev/shared-assets/environments/studio.hdr',
    sunrise: 'https://modelviewer.dev/shared-assets/environments/spruit_sunrise_2k.hdr',
    city: 'https://modelviewer.dev/shared-assets/environments/urban_street_2k.hdr',
    sunset: 'https://modelviewer.dev/shared-assets/environments/venice_sunset_1k.hdr',
    forest: 'https://modelviewer.dev/shared-assets/environments/forest_slope_1k.hdr',
    neutral: 'https://modelviewer.dev/shared-assets/environments/neutral.hdr'
  }

  // 处理模型文件
  const modelSrc = src || (modelFile ? URL.createObjectURL(modelFile) : '')

  // 检查Model Viewer是否已加载
  const isModelViewerLoaded = () => {
    if (typeof window === 'undefined') return false
    return !!(window as any).customElements?.get('model-viewer')
  }

  // 等待Model Viewer加载
  const waitForModelViewer = () => {
    return new Promise<void>((resolve) => {
      if (isModelViewerLoaded()) {
        resolve()
        return
      }

      const checkInterval = setInterval(() => {
        if (isModelViewerLoaded()) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      // 超时保护
      setTimeout(() => {
        clearInterval(checkInterval)
        resolve()
      }, 10000)
    })
  }

  // 重置相机
  const resetCamera = () => {
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = '0deg 75deg 5m'
      viewerRef.current.cameraTarget = '0m 0m 0m'
      viewerRef.current.fieldOfView = '45deg'
    }
  }

  // 重置所有设置
  const resetAll = () => {
    resetCamera()
    if (viewerRef.current) {
      viewerRef.current.autoRotate = true
      viewerRef.current.rotationPerSecond = '20deg'
      viewerRef.current.shadowIntensity = 1
      viewerRef.current.shadowSoftness = 0.6
      viewerRef.current.exposure = 1
      viewerRef.current.environmentIntensity = 1
    }
  }

  // 切换全屏
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  // 下载当前视图截图
  const downloadScreenshot = async () => {
    if (viewerRef.current) {
      try {
        const dataURL = await viewerRef.current.toDataURL('image/png')
        const link = document.createElement('a')
        link.href = dataURL
        link.download = `model-screenshot-${Date.now()}.png`
        link.click()
      } catch (err) {
        console.error('截图失败:', err)
      }
    }
  }

  // 分享模型
  const shareModel = () => {
    if (navigator.share && modelSrc) {
      navigator.share({
        title: '3D模型预览',
        text: '查看我的3D模型',
        url: window.location.href
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('链接已复制到剪贴板'))
        .catch(console.error)
    }
  }

  // 监听模型加载
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const handleLoad = () => {
      console.log('Model loaded successfully:', modelSrc)
      setIsLoaded(true)
      setIsLoading(false)
      setError(null)

      // 尝试获取模型信息
      try {
        const model = viewer.model
        if (model) {
          const info = {
            materials: model.materials?.length || 0,
            meshes: model.meshes?.length || 0,
            animations: model.animations?.length || 0,
            textures: model.textures?.length || 0
          }
          setModelInfo(info)
          onModelLoad?.(info)
        }
      } catch (err) {
        console.warn('获取模型信息失败:', err)
      }
    }

    const handleError = (event: any) => {
      setError('模型加载失败')
      setIsLoading(false)
      setIsLoaded(false)
      console.error('模型加载错误:', event)
    }

    const handleProgress = (e: any) => {
      console.log('Loading progress:', e.detail?.totalProgress || 'unknown')
    }

    // 添加事件监听器
    viewer.addEventListener('load', handleLoad)
    viewer.addEventListener('error', handleError)
    viewer.addEventListener('progress', handleProgress)

    return () => {
      // 清理事件监听器
      viewer.removeEventListener('load', handleLoad)
      viewer.removeEventListener('error', handleError)
      viewer.removeEventListener('progress', handleProgress)
    }
  }, [modelSrc, onModelLoad])

  // 开始加载
  useEffect(() => {
    if (modelSrc) {
      setIsLoading(true)
      setError(null)

      // 等待Model Viewer加载后再初始化
      waitForModelViewer().then(() => {
        console.log('Model Viewer loaded, initializing with model:', modelSrc)
        // 设置一个超时来检测模型是否真的在加载
        setTimeout(() => {
          if (isLoading && !isLoaded && !error) {
            setError('模型加载超时，请检查文件是否有效或网络连接')
            setIsLoading(false)
          }
        }, 10000) // 10秒超时
      })
    } else {
      setIsLoading(false)
      setError(null)
      setIsLoaded(false)
    }
  }, [modelSrc])

  // 清理对象URL
  useEffect(() => {
    return () => {
      if (modelFile && src?.startsWith('blob:')) {
        URL.revokeObjectURL(src)
      }
    }
  }, [modelFile, src])

  if (!modelSrc) {
    return (
      <div className={`flex items-center justify-center bg-gray-800/30 border border-gray-700 rounded-xl ${className}`}>
        <div className="text-center p-8">
          <div className="bg-gray-700 w-24 h-24 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <Grid className="h-12 w-12 text-gray-500" />
          </div>
          <p className="text-gray-400 font-medium">请选择或上传3D模型文件</p>
          <p className="text-gray-500 text-sm mt-2">支持 .glb, .gltf, .obj, .fbx 等格式</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <Script
        src="https://unpkg.com/@google/model-viewer@latest/dist/model-viewer.min.js"
        strategy="beforeInteractive"
      />

      {/* 3D模型查看器 */}
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        {!isModelViewerLoaded() ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">正在加载3D查看器...</p>
              <p className="text-gray-500 text-sm mt-2">请稍候</p>
            </div>
          </div>
        ) : (
          <model-viewer
            ref={viewerRef}
            src={modelSrc}
            auto-rotate={autoRotate}
            rotation-per-second="20deg"
            camera-controls
            touch-action="pan-y"
            shadow-intensity={shadows ? 1 : 0}
            shadow-softness={0.6}
            environment-image={environmentPresets[environment as keyof typeof environmentPresets] || environmentPresets.studio}
            environment-intensity={1}
            field-of-view="45deg"
            exposure={1}
            loading="eager"
            reveal="auto"
            ar-modes="webxr scene-viewer quick-look"
            ar
            style={{
              width: '100%',
              height: '100%',
              background: backgroundColor,
              borderRadius: '0.75rem'
            }}
          />
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-white font-medium">加载模型中...</p>
              <p className="text-gray-300 text-sm mt-2">正在处理 {modelFile?.name || '模型文件'}</p>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-500 w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Grid className="h-8 w-8 text-white" />
              </div>
              <p className="text-red-400 font-medium">{error}</p>
              <p className="text-red-300 text-sm mt-2">
                请检查文件格式是否正确
              </p>
              <div className="mt-4 space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  重新加载
                </button>
                <button
                  onClick={() => {
                    // 尝试使用备用加载方式
                    if (modelSrc) {
                      window.open(modelSrc, '_blank')
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  在新窗口打开
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 控制面板 */}
        {isLoaded && (
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <button
              onClick={resetCamera}
              className="bg-black/60 backdrop-blur-md text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
              title="重置视角"
            >
              <Camera className="h-4 w-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="bg-black/60 backdrop-blur-md text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
              title="全屏"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={downloadScreenshot}
              className="bg-black/60 backdrop-blur-md text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
              title="截图"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={shareModel}
              className="bg-black/60 backdrop-blur-md text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
              title="分享"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 模型信息 */}
        {isLoaded && modelInfo && (
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md rounded-lg p-3 text-white">
            <h4 className="text-sm font-medium mb-2">模型信息</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex items-center space-x-1">
                <Grid className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">网格:</span>
                <span>{modelInfo.meshes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="h-3 w-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-sm"></div>
                <span className="text-gray-300">材质:</span>
                <span>{modelInfo.materials}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sun className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">纹理:</span>
                <span>{modelInfo.textures}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Play className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">动画:</span>
                <span>{modelInfo.animations}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModelViewer
export { ModelViewer as EnhancedModelViewer }