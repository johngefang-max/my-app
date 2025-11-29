'use client'

import { useState } from 'react'
import { ArrowRightLeft, Download, CheckCircle, AlertCircle } from 'lucide-react'

interface ModelFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  url: string
}

interface ConversionFormat {
  format: string
  extension: string
  description: string
  features: string[]
  compatibility: string[]
}

const supportedFormats: ConversionFormat[] = [
  {
    format: 'GLB',
    extension: '.glb',
    description: '二进制glTF格式，包含纹理',
    features: ['紧凑文件大小', '自包含纹理', 'Web优化'],
    compatibility: ['Unity', 'Three.js', 'Babylon.js', 'A-Frame']
  },
  {
    format: 'GLTF',
    extension: '.gltf',
    description: 'JSON格式的3D场景描述',
    features: ['人类可读', '分离纹理文件', '版本控制友好'],
    compatibility: ['Unity', 'Three.js', 'Babylon.js', 'Blender']
  },
  {
    format: 'OBJ',
    extension: '.obj',
    description: '传统3D模型格式',
    features: ['广泛支持', '简单几何', '材质文件(.mtl)'],
    compatibility: ['Blender', '3ds Max', 'Maya', '大部分3D软件']
  },
  {
    format: 'FBX',
    extension: '.fbx',
    description: 'Autodesk电影和游戏格式',
    features: ['动画支持', '材质和纹理', '骨骼系统'],
    compatibility: ['3ds Max', 'Maya', 'Unity', 'Unreal Engine']
  },
  {
    format: 'STL',
    extension: '.stl',
    description: '3D打印标准格式',
    features: ['三角网格', '简单几何', '3D打印优化'],
    compatibility: ['3D打印机', 'CAD软件', ' slicer软件']
  },
  {
    format: 'DAE',
    extension: '.dae',
    description: 'Collada数字资产交换格式',
    features: ['动画支持', '材质', '场景层次'],
    compatibility: ['Blender', 'SketchUp', '3ds Max']
  }
]

interface ModelConverterProps {
  files: ModelFile[]
  onConversionComplete?: (convertedFiles: ModelFile[]) => void
}

export default function ModelConverter({ files, onConversionComplete }: ModelConverterProps) {
  const [conversions, setConversions] = useState<Map<string, {
    from: string
    to: string
    status: 'idle' | 'converting' | 'completed' | 'error'
    progress: number
    error?: string
    result?: ModelFile
  }>>(new Map())

  const [batchTargetFormat, setBatchTargetFormat] = useState<string>('glb')

  // 模拟转换过程（实际应用中这里会调用API）
  const convertModel = async (
    file: ModelFile,
    targetFormat: string
  ): Promise<{ success: boolean; convertedFile?: ModelFile; error?: string }> => {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟转换成功
        const targetInfo = supportedFormats.find(f => f.format.toLowerCase() === targetFormat)
        if (targetInfo) {
          // 创建一个新的转换后的文件（模拟）
          const convertedFile: ModelFile = {
            id: Math.random().toString(36).substr(2, 9),
            file: file.file, // 实际中这里会是转换后的文件
            name: file.name.replace(/\.[^/.]+$/, '') + targetInfo.extension,
            size: file.size * 0.8, // 假设压缩了20%
            type: targetFormat,
            url: file.url // 实际中这里会是新的URL
          }
          resolve({ success: true, convertedFile })
        } else {
          resolve({ success: false, error: `不支持的目标格式: ${targetFormat}` })
        }
      }, 2000 + Math.random() * 2000) // 2-4秒的转换时间
    })
  }

  const handleSingleConversion = async (fileId: string, targetFormat: string) => {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    const conversionId = `${fileId}-${targetFormat}`

    setConversions(prev => {
      const newConversions = new Map(prev)
      newConversions.set(conversionId, {
        from: file.type,
        to: targetFormat,
        status: 'converting',
        progress: 0
      })
      return newConversions
    })

    // 模拟进度更新
    const progressInterval = setInterval(() => {
      setConversions(prev => {
        const conversion = prev.get(conversionId)
        if (conversion && conversion.status === 'converting') {
          const newConversions = new Map(prev)
          newConversions.set(conversionId, {
            ...conversion,
            progress: Math.min(conversion.progress + Math.random() * 30, 90)
          })
          return newConversions
        }
        return prev
      })
    }, 500)

    try {
      const result = await convertModel(file, targetFormat)
      clearInterval(progressInterval)

      setConversions(prev => {
        const newConversions = new Map(prev)
        newConversions.set(conversionId, {
          from: file.type,
          to: targetFormat,
          status: result.success ? 'completed' : 'error',
          progress: 100,
          error: result.error,
          result: result.convertedFile
        })
        return newConversions
      })

      if (result.success && result.convertedFile) {
        onConversionComplete?.([result.convertedFile])
      }
    } catch (error) {
      clearInterval(progressInterval)
      setConversions(prev => {
        const newConversions = new Map(prev)
        newConversions.set(conversionId, {
          from: file.type,
          to: targetFormat,
          status: 'error',
          progress: 100,
          error: error instanceof Error ? error.message : '转换失败'
        })
        return newConversions
      })
    }
  }

  const handleBatchConversion = async (targetFormat: string) => {
    const conversionPromises = files.map(file =>
      handleSingleConversion(file.id, targetFormat)
    )

    await Promise.all(conversionPromises)
  }

  const downloadConvertedFile = (conversion: any) => {
    if (conversion.result && conversion.result.url) {
      const link = document.createElement('a')
      link.href = conversion.result.url
      link.download = conversion.result.name
      link.click()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (files.length === 0) {
    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 text-center">
        <ArrowRightLeft className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 font-medium">请先上传模型文件</p>
        <p className="text-gray-500 text-sm mt-2">支持多种3D格式转换</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 批量转换 */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">批量转换</h3>

        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-white text-sm mb-2">目标格式</label>
            <select
              value={batchTargetFormat}
              onChange={(e) => setBatchTargetFormat(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              {supportedFormats.map(format => (
                <option key={format.extension} value={format.format.toLowerCase()}>
                  {format.format} - {format.description}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleBatchConversion(batchTargetFormat)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>全部转换</span>
          </button>
        </div>
      </div>

      {/* 单个文件转换 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">单个文件转换</h3>

        {files.map(file => {
          const currentConversions = Array.from(conversions.entries())
            .filter(([key]) => key.startsWith(file.id + '-'))

          return (
            <div key={file.id} className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-white font-medium">{file.name}</h4>
                  <p className="text-gray-400 text-sm">
                    {file.type.toUpperCase()} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {supportedFormats.map(format => {
                  const conversionId = `${file.id}-${format.format.toLowerCase()}`
                  const conversion = conversions.get(conversionId)

                  return (
                    <div key={format.format} className="relative">
                      <button
                        onClick={() => !conversion && handleSingleConversion(file.id, format.format.toLowerCase())}
                        disabled={conversion?.status === 'converting'}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          conversion?.status === 'converting'
                            ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 cursor-not-allowed'
                            : conversion?.status === 'completed'
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : conversion?.status === 'error'
                            ? 'border-red-500 bg-red-500/10 text-red-400'
                            : 'border-gray-600 bg-gray-900/50 text-gray-300 hover:border-purple-500 hover:bg-purple-500/10'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-1">
                          {conversion?.status === 'converting' && (
                            <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent"></div>
                          )}
                          {conversion?.status === 'completed' && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {conversion?.status === 'error' && (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          <span>{format.format}</span>
                        </div>
                      </button>

                      {/* 进度条 */}
                      {conversion?.status === 'converting' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-700 rounded-full h-1">
                            <div
                              className="bg-yellow-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${conversion.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1 text-center">
                            {Math.round(conversion.progress)}%
                          </p>
                        </div>
                      )}

                      {/* 下载按钮 */}
                      {conversion?.status === 'completed' && conversion.result && (
                        <button
                          onClick={() => downloadConvertedFile(conversion)}
                          className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded text-xs flex items-center justify-center space-x-1"
                        >
                          <Download className="h-3 w-3" />
                          <span>下载</span>
                        </button>
                      )}

                      {/* 错误提示 */}
                      {conversion?.status === 'error' && (
                        <p className="text-xs text-red-400 mt-1">
                          {conversion.error}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 格式说明 */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">支持格式说明</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {supportedFormats.map(format => (
            <div key={format.format} className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">
                {format.format} {format.extension}
              </h4>
              <p className="text-gray-400 text-sm mb-3">{format.description}</p>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">特性:</p>
                  <div className="flex flex-wrap gap-1">
                    {format.features.map(feature => (
                      <span
                        key={feature}
                        className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">兼容性:</p>
                  <div className="flex flex-wrap gap-1">
                    {format.compatibility.slice(0, 3).map(comp => (
                      <span
                        key={comp}
                        className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                      >
                        {comp}
                      </span>
                    ))}
                    {format.compatibility.length > 3 && (
                      <span className="text-gray-500 text-xs">+{format.compatibility.length - 3} 更多</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}