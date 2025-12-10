'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Upload, Type, Image as ImageIcon, Send, Download, Sparkles, RotateCcw,
  Settings, Eye, Grid, Layers, Palette, Zap, Plus, Minus,
  Sun, Moon, Camera, Share2, Save, FolderOpen, FileText
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import React from 'react'
import ModelUploader from '@/components/ModelUploader'
import ModelViewer from '../components/ModelViewer'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { FAL_APIS, PARAM_RANGES, PARAM_OPTIONS } from '@/config/fal-api'

interface ModelFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  url: string
  preview?: string
}

export default function NewGenerator() {
  const { t, language } = useLanguage()
  const { user, isAuthenticated, refreshUserData } = useAuth()
  const [activeTab, setActiveTab] = useState<'generate' | 'import'>('generate')
  // FAL-AI模型选择和参数状态
  const [selectedModel, setSelectedModel] = useState<string>('fal-ai/trellis')
  const [activeMethod, setActiveMethod] = useState<'text' | 'image'>('text')
  const [textInput, setTextInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedModel, setGeneratedModel] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<ModelFile[]>([])
  const [selectedFile, setSelectedFile] = useState<ModelFile | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  // 页面加载时自动设置测试模型
  useEffect(() => {
    const testModel: ModelFile = {
      id: 'test-glb-auto',
      file: new File([''], 'test.glb'),
      name: 'Test Model (GLB)',
      size: 500000,
      type: 'glb',
      url: '/test-models/test.glb'
    }
    setUploadedFiles([testModel])
    setSelectedFile(testModel)
  }, [])

  // 根据选定模型获取配置信息
  const currentModelConfig = FAL_APIS[selectedModel as keyof typeof FAL_APIS]
  const MODEL_I18N: Record<string, { name: string; desc: string }> = {
    'fal-ai/nano-banana-pro': {
      name: 'generator.model.nanoBanana.name',
      desc: 'generator.model.nanoBanana.desc'
    },
    'fal-ai/nano-banana-pro/edit': {
      name: 'generator.model.nanoBananaEdit.name',
      desc: 'generator.model.nanoBananaEdit.desc'
    },
    'fal-ai/trellis': {
      name: 'generator.model.trellis.name',
      desc: 'generator.model.trellis.desc'
    }
  }

  // 参数状态 - 包含所有可能的参数
  const [params, setParams] = useState({
    // 通用参数
    seed: null as number | null,
    sync_mode: false,

    // 图像生成参数 (Nano Banana Pro)
    num_inference_steps: 20,
    guidance_scale: 7.5,
    width: 1024,
    height: 1024,
    negative_prompt: '',
    num_images: 1,

    // 图像编辑参数 (Nano Banana Pro Edit)
    strength: 0.8,

    // 3D模型生成参数 (Trellis)
    scale: 1.0,
    num_samples: 1,
    output_format: 'glb' as 'glb' | 'obj' | 'gltf' | 'ply',
    simplify: false,
    texture_size: 1024,
    max_faces: 10000
  })

  // 预览器设置
  const [viewerSettings, setViewerSettings] = useState({
    autoRotate: true,
    environment: 'studio',
    backgroundColor: '#0f172a',
    showGrid: true,
    shadows: true,
    fov: 45
  })

  // 处理图片上传
  const handleImageUpload = async (files: File[]) => {
    const processedUrls: string[] = []

    for (const file of files) {
      // 将图片文件转换为base64 data URL
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      processedUrls.push(dataUrl)
    }

    setUploadedImages(prev => [...prev, ...processedUrls])
  }

  // 统一的生成处理函数
  const handleGenerate = async () => {
    if (!isAuthenticated || !user) {
      alert('请先登录')
      return
    }

    // 检查用户邮箱是否存在
    if (!user.email) {
      console.error('User email is missing:', user)
      alert('用户信息不完整，请重新登录')
      return
    }

    if (!textInput && activeMethod === 'text' && !uploadedImages.length) return

    console.log('Starting generation with user:', { email: user.email, points: user.points })

    setIsGenerating(true)
    try {
      // 构建请求数据，只包含选定模型支持的参数
      const requestData: any = {
        model_id: selectedModel,
        prompt: textInput || (currentModelConfig.type === 'image-to-3d' ? '3D model' : 'image'),
      }

      // 根据模型类型添加特定参数
      if (selectedModel === 'fal-ai/nano-banana-pro') {
        // 文本转图像模型
        Object.assign(requestData, {
          seed: params.seed,
          sync_mode: params.sync_mode,
          num_inference_steps: params.num_inference_steps,
          guidance_scale: params.guidance_scale,
          width: params.width,
          height: params.height,
          negative_prompt: params.negative_prompt || undefined,
          num_images: params.num_images
        })
      } else if (selectedModel === 'fal-ai/nano-banana-pro/edit') {
        // 图像编辑模型 - 需要图片
        if (!uploadedImages.length) {
          throw new Error('图像编辑需要提供图片')
        }
        // 使用第一张图片的base64 data URL
        Object.assign(requestData, {
          image_url: uploadedImages[0], // 现在uploadedImages已经是base64 data URLs
          seed: params.seed,
          sync_mode: params.sync_mode,
          num_inference_steps: params.num_inference_steps,
          guidance_scale: params.guidance_scale,
          width: params.width,
          height: params.height,
          negative_prompt: params.negative_prompt || undefined,
          strength: params.strength
        })
      } else if (selectedModel === 'fal-ai/trellis') {
        // 3D模型生成
        if (uploadedImages.length > 0) {
          requestData.image_url = uploadedImages[0] // 使用base64 data URL而不是blob URL
        }
        Object.assign(requestData, {
          seed: params.seed,
          sync_mode: params.sync_mode,
          scale: params.scale,
          num_samples: params.num_samples,
          output_format: params.output_format,
          simplify: params.simplify,
          texture_size: params.texture_size,
          max_faces: params.max_faces
        })
      }

      console.log(`Sending ${currentModelConfig.type} request with ${selectedModel} parameters:`, requestData)

      const response = await fetch('/api/fal/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: currentModelConfig.type === 'image-to-3d' ? '3d' : 'image',
          data: requestData,
          userEmail: user.email  // 使用email而不是id进行验证
        })
      })

      const result = await response.json()
      console.log('API response:', result)

      if (response.ok) {
        // 刷新用户数据以更新积分
        await refreshUserData()

        if (currentModelConfig.type === 'image-to-3d') {
          // 3D模型生成
          const modelUrl = result.data?.model_url || result.data?.output?.[0] || result.data?.url
          if (modelUrl) {
            setGeneratedModel(modelUrl)
            setGeneratedImages([])
            console.log('3D模型生成成功:', modelUrl)
          } else {
            console.error('未找到模型URL:', result)
            alert('生成成功但未获取到模型URL，请检查API响应格式')
          }
        } else {
          // 图像生成
          const images = result.data?.images || result.data || []
          if (images.length > 0) {
            setGeneratedImages(images.map((img: any) => img.url || img))
            setGeneratedModel(null)
            console.log('图像生成成功:', images.length, '张')
          } else {
            console.error('未找到图像URL:', result)
            alert('生成成功但未获取到图像URL，请检查API响应格式')
          }
        }

        // 显示积分消耗信息
        if (result.generation) {
          alert(`生成成功！消耗 ${result.generation.points_cost} 积分，剩余 ${result.generation.remaining_points} 积分`)
        }
      } else {
        console.error('生成失败:', result.error || result)
        const errorMsg = result.error || result.message || result.details?.error || '未知错误'

        // 处理积分不足的情况
        if (response.status === 402) {
          alert(`积分不足！需要 ${result.required} 积分，当前只有 ${result.available} 积分`)
        } else if (response.status === 401) {
          // 用户验证失败
          console.error('Authentication failed:', result)
          alert(`用户验证失败: ${result.details || result.error}。请重新登录。`)
          // 可选：重定向到登录页面或刷新用户数据
          await refreshUserData()
        } else {
          alert(`生成失败: ${errorMsg}`)
        }
      }
    } catch (error) {
      console.error('生成失败:', error)
      alert(`生成失败: ${error instanceof Error ? error.message : '网络错误'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // 触发图片上传
  const triggerImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,.jpg,.jpeg,.png,.webp'
    input.multiple = true
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement | null
      const files = Array.from(target?.files ?? [])
      if (files.length > 0) {
        await handleImageUpload(files)
      }
    }
    input.click()
  }

  // 触发文件上传
  const triggerFileUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.glb,.gltf,.obj,.fbx,.stl,.dae,.ply'
    input.multiple = true
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement | null
      const files = Array.from(target?.files ?? [])

      // 检查是否有图片文件
      const imageFiles = files.filter(file =>
        file.type.startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'webp'].some(ext =>
          file.name.toLowerCase().endsWith('.' + ext)
        )
      )

      const modelFiles = files.filter(file =>
        !file.type.startsWith('image/') &&
        ['glb', 'gltf', 'obj', 'fbx', 'stl', 'dae', 'ply'].some(ext =>
          file.name.toLowerCase().endsWith('.' + ext)
        )
      )

      // 处理图片上传
      if (imageFiles.length > 0) {
        await handleImageUpload(imageFiles)
      }

      // 处理模型文件上传
      if (modelFiles.length > 0) {
        const newFiles: ModelFile[] = modelFiles.map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
          type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
          url: URL.createObjectURL(file)
        }))
        setUploadedFiles(prev => [...prev, ...newFiles])
        if (newFiles.length > 0 && !selectedFile) {
          setSelectedFile(newFiles[0])
        }
      }
    }
    input.click()
  }

  // 下载图像到本地
  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `generated-image-${index + 1}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log('图像下载成功:', link.download)
    } catch (error) {
      console.error('图像下载失败:', error)
      alert('图像下载失败')
    }
  }

  // 下载3D模型到本地
  const downloadModel = async (modelUrl: string) => {
    try {
      const response = await fetch(modelUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `generated-3d-model-${Date.now()}.${params.output_format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      console.log('3D模型下载成功:', link.download)
    } catch (error) {
      console.error('3D模型下载失败:', error)
      alert('3D模型下载失败')
    }
  }

  // 保存模型
  const handleSave = async () => {
    if (!generatedModel && generatedImages.length === 0 && !selectedFile) return

    try {
      let saveData
      if (generatedModel) {
        saveData = {
          title: 'AI生成3D模型',
          url: generatedModel,
          type: 'ai_generated',
          model_type: '3d'
        }
      } else if (generatedImages.length > 0) {
        saveData = {
          title: 'AI生成图像',
          url: generatedImages[0],
          type: 'ai_generated',
          model_type: 'image'
        }
      } else if (selectedFile) {
        saveData = {
          title: selectedFile.name,
          url: selectedFile.url,
          type: 'uploaded',
          model_type: '3d'
        }
      }

      if (saveData) {
        const response = await fetch('/api/models/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saveData)
        })

        if (response.ok) {
          alert('保存成功！')
        }
      }
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  // 清理资源 - 只清理model文件的blob URLs
  React.useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => URL.revokeObjectURL(file.url))
      // data URLs不需要清理
    }
  }, [uploadedFiles])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Script
        src="https://unpkg.com/@google/model-viewer@latest/dist/model-viewer.min.js"
        strategy="beforeInteractive"
      />

      {/* 头部 */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">{t('generator.studio.title')}</h1>
                <p className="text-gray-400 text-sm">{t('generator.studio.subtitle')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* 积分显示 */}
              {user && isAuthenticated && (
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-400">可用积分</span>
                  <span className={`text-lg font-bold ${
                    user.points >= 10 ? 'text-green-400' :
                    user.points >= 5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {user.points}
                  </span>
                  <span className="text-xs text-gray-500">(每次-3)</span>
                </div>
              )}

              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-lg transition-colors ${
                  showPreview
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300'
                }`}
                title="预览窗口"
              >
                <Eye className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主标签导航 */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === 'generate'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>{t('generator.tabs.generate')}</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === 'import'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>{t('generator.tabs.import')}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* 左侧工作区 */}
        <div className={`${showPreview ? 'w-3/5' : 'w-full'} border-r border-white/10 overflow-y-auto`}>
          <div className="max-w-4xl mx-auto p-6 space-y-6" style={{scrollbarWidth: 'thin', scrollbarColor: 'transparent'}}>
            <style jsx>{`
              /* Hide scrollbar for Chrome, Safari and Opera */
              ::-webkit-scrollbar {
                width: 0px;
                background: transparent;
              }
              /* Hide scrollbar for IE, Edge and Firefox */
              div {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            {/* AI生成区域 */}
            {activeTab === 'generate' && (
              <div className="space-y-6">
                {/* FAL-AI模型选择 */}
                <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">{t('generator.engine.title')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(FAL_APIS).map(([modelId, config]) => (
                      <button
                        key={modelId}
                        onClick={() => setSelectedModel(modelId)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedModel === modelId
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="font-semibold mb-2">{t(MODEL_I18N[modelId].name)}</div>
                        <div className="text-sm opacity-75 mb-2">{t(MODEL_I18N[modelId].desc)}</div>
                        <div className="text-xs opacity-60">
                          {t('generator.model.typeLabel')}: {config.type === 'text-to-image' ? t('generator.mode.textToImage') :
                                config.type === 'image-edit' ? t('generator.mode.imageEdit') : t('generator.mode.imageTo3d')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 生成方法选择 */}
                <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-4">{t('generator.input.title')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveMethod('text')}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        activeMethod === 'text'
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Type className="h-10 w-10 mx-auto mb-3" />
                      <div className="font-semibold mb-2">{t('generator.input.text')}</div>
                      <div className="text-sm opacity-75">
                        {t('generator.input.text.desc')}
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveMethod('image')}
                      disabled={currentModelConfig?.type === 'text-to-image'}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        activeMethod === 'image'
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : currentModelConfig?.type === 'text-to-image'
                          ? 'border-gray-700 bg-gray-900/50 text-gray-500 cursor-not-allowed'
                          : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <ImageIcon className="h-10 w-10 mx-auto mb-3" />
                      <div className="font-semibold mb-2">{t('generator.input.image')}</div>
                      <div className="text-sm opacity-75">
                        {currentModelConfig?.type === 'image-edit' ? t('generator.input.image.desc.edit') :
                         currentModelConfig?.type === 'image-to-3d' ? t('generator.input.image.desc.imageTo3d') :
                         t('generator.input.image.desc.disabled')}
                      </div>
                    </button>
                  </div>
                  {currentModelConfig?.type === 'text-to-image' && activeMethod === 'image' && (
                    <p className="text-yellow-400 text-sm mt-2">{t('generator.warn.nanoBananaTextOnly')}</p>
                  )}
                </div>

                {/* 输入区域 */}
                <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                  {activeMethod === 'text' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">{t('generator.text.title')}</h3>
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={t('generator.text.placeholder')}
                        className="w-full h-32 bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">{textInput.length}/500 {t('generator.text.characters')}</span>
                      </div>
                    </div>
                  )}

                  {activeMethod === 'image' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">{t('generator.image.title')}</h3>
                      <div
                        onClick={triggerImageUpload}
                        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                      >
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-white mb-2">{t('generator.image.upload')}</p>
                        <p className="text-gray-400 text-sm">{t('generator.image.support')}</p>
                      </div>

                      

                      {/* 显示已上传的图片 */}
                      {uploadedImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          {uploadedImages.map((url, index) => (
                            <div key={index} className="relative group">
                              <Image
                                src={url}
                                alt={`${t('generator.preview.imageLabel')} ${index + 1}`}
                                width={100}
                                height={100}
                                className="rounded-lg object-cover"
                                unoptimized
                              />
                              <button
                                onClick={() => {
                                  setUploadedImages(prev => prev.filter((_, i) => i !== index))
                                  // data URLs不需要revokeObjectURL
                                }}
                                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <span className="sr-only">{t('generator.image.remove')}</span>
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 参数控制面板 */}
                <div className="bg-black/30 rounded-2xl p-6 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      {currentModelConfig?.name} {t('generator.settings.headerSuffix')}
                    </h3>
                    <span className="text-sm text-gray-400">
                      {(currentModelConfig?.type === 'text-to-image' ? t('generator.mode.textToImage') :
                       currentModelConfig?.type === 'image-edit' ? t('generator.mode.imageEdit') : t('generator.mode.imageTo3d'))} {t('generator.mode.suffix')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Seed 随机种子 - 所有模型通用 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-300">{t('generator.params.seed')}</label>
                        <button
                          onClick={() => setParams(prev => ({ ...prev, seed: null }))}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          {t('generator.params.random')}
                        </button>
                      </div>
                      <input
                        type="number"
                        value={params.seed || ''}
                        onChange={(e) => setParams(prev => ({
                          ...prev,
                          seed: e.target.value ? parseInt(e.target.value) : null
                        }))}
                        placeholder={t('generator.params.seedPlaceholder')}
                        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* 同步模式 - 所有模型通用 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">{t('generator.params.syncMode')}</label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setParams(prev => ({ ...prev, sync_mode: !prev.sync_mode }))}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            params.sync_mode ? 'bg-purple-600' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            params.sync_mode ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                        <span className="text-sm text-gray-400">
                          {params.sync_mode ? t('common.on') : t('common.off')}
                        </span>
                      </div>
                    </div>

                    {/* 图像生成特有参数 (Nano Banana Pro & Edit) */}
                    {(currentModelConfig?.type === 'text-to-image' || currentModelConfig?.type === 'image-edit') && (
                      <>
                        {/* 推理步数 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">{t('generator.params.numInferenceSteps')}</label>
                            <span className="text-sm text-purple-400">{params.num_inference_steps}</span>
                          </div>
                          <input
                            type="range"
                            min={PARAM_RANGES.num_inference_steps.min}
                            max={PARAM_RANGES.num_inference_steps.max}
                            step={PARAM_RANGES.num_inference_steps.step}
                            value={params.num_inference_steps}
                            onChange={(e) => setParams(prev => ({
                              ...prev,
                              num_inference_steps: parseInt(e.target.value)
                            }))}
                            className="w-full accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{PARAM_RANGES.num_inference_steps.min}</span>
                            <span>{PARAM_RANGES.num_inference_steps.max}</span>
                          </div>
                        </div>

                        {/* 引导强度 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">{t('generator.params.guidanceScale')}</label>
                            <span className="text-sm text-purple-400">{params.guidance_scale.toFixed(1)}</span>
                          </div>
                          <input
                            type="range"
                            min={PARAM_RANGES.guidance_scale.min}
                            max={PARAM_RANGES.guidance_scale.max}
                            step={PARAM_RANGES.guidance_scale.step}
                            value={params.guidance_scale}
                            onChange={(e) => setParams(prev => ({
                              ...prev,
                              guidance_scale: parseFloat(e.target.value)
                            }))}
                            className="w-full accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{PARAM_RANGES.guidance_scale.min}</span>
                            <span>{PARAM_RANGES.guidance_scale.max}</span>
                          </div>
                        </div>

                        {/* 图像尺寸 */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">{t('generator.params.imageSize')}</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-400">{t('generator.params.width')}</label>
                              <input
                                type="number"
                                min={PARAM_RANGES.width.min}
                                max={PARAM_RANGES.width.max}
                                step={PARAM_RANGES.width.step}
                                value={params.width}
                                onChange={(e) => setParams(prev => ({
                                  ...prev,
                                  width: parseInt(e.target.value)
                                }))}
                                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">{t('generator.params.height')}</label>
                              <input
                                type="number"
                                min={PARAM_RANGES.height.min}
                                max={PARAM_RANGES.height.max}
                                step={PARAM_RANGES.height.step}
                                value={params.height}
                                onChange={(e) => setParams(prev => ({
                                  ...prev,
                                  height: parseInt(e.target.value)
                                }))}
                                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-2 py-1 text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 负面提示词 */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">{t('generator.params.negativePrompt')}</label>
                          <textarea
                            value={params.negative_prompt}
                            onChange={(e) => setParams(prev => ({ ...prev, negative_prompt: e.target.value }))}
                            placeholder={t('generator.params.negativePromptPlaceholder')}
                            className="w-full h-20 bg-gray-800/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none text-sm"
                          />
                        </div>

                        {/* 图像数量 (仅文本转图像) */}
                        {currentModelConfig?.type === 'text-to-image' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-300">{t('generator.params.numImages')}</label>
                              <span className="text-sm text-purple-400">{params.num_images}</span>
                            </div>
                            <input
                              type="range"
                              min={PARAM_RANGES.num_images.min}
                              max={PARAM_RANGES.num_images.max}
                              step={PARAM_RANGES.num_images.step}
                              value={params.num_images}
                              onChange={(e) => setParams(prev => ({
                                ...prev,
                                num_images: parseInt(e.target.value)
                              }))}
                              className="w-full accent-purple-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{PARAM_RANGES.num_images.min}</span>
                              <span>{PARAM_RANGES.num_images.max}</span>
                            </div>
                          </div>
                        )}

                        {/* 编辑强度 (仅图像编辑) */}
                        {currentModelConfig?.type === 'image-edit' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-300">{t('generator.params.strength')}</label>
                              <span className="text-sm text-purple-400">{params.strength.toFixed(1)}</span>
                            </div>
                            <input
                              type="range"
                              min={PARAM_RANGES.strength.min}
                              max={PARAM_RANGES.strength.max}
                              step={PARAM_RANGES.strength.step}
                              value={params.strength}
                              onChange={(e) => setParams(prev => ({
                                ...prev,
                                strength: parseFloat(e.target.value)
                              }))}
                              className="w-full accent-purple-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{PARAM_RANGES.strength.min}</span>
                              <span>{PARAM_RANGES.strength.max}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* 3D模型生成特有参数 (Trellis) */}
                    {currentModelConfig?.type === 'image-to-3d' && (
                      <>
                        {/* 3D模型缩放 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">{t('generator.params.scale')}</label>
                            <span className="text-sm text-purple-400">{params.scale.toFixed(1)}</span>
                          </div>
                          <input
                            type="range"
                            min={PARAM_RANGES.scale.min}
                            max={PARAM_RANGES.scale.max}
                            step={PARAM_RANGES.scale.step}
                            value={params.scale}
                            onChange={(e) => setParams(prev => ({
                              ...prev,
                              scale: parseFloat(e.target.value)
                            }))}
                            className="w-full accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{PARAM_RANGES.scale.min}</span>
                            <span>{PARAM_RANGES.scale.max}</span>
                          </div>
                        </div>

                        {/* 生成样本数量 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">{t('generator.params.numSamples')}</label>
                            <span className="text-sm text-purple-400">{params.num_samples}</span>
                          </div>
                          <input
                            type="range"
                            min={PARAM_RANGES.num_samples.min}
                            max={PARAM_RANGES.num_samples.max}
                            step={PARAM_RANGES.num_samples.step}
                            value={params.num_samples}
                            onChange={(e) => setParams(prev => ({
                              ...prev,
                              num_samples: parseInt(e.target.value)
                            }))}
                            className="w-full accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{PARAM_RANGES.num_samples.min}</span>
                            <span>{PARAM_RANGES.num_samples.max}</span>
                          </div>
                        </div>

                        {/* 输出格式 */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">{t('generator.params.outputFormat')}</label>
                          <div className="grid grid-cols-2 gap-2">
                            {PARAM_OPTIONS.output_format.map(format => (
                              <button
                                key={format}
                                onClick={() => setParams(prev => ({ ...prev, output_format: format as any }))}
                                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                                  params.output_format === format
                                    ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                                }`}
                              >
                                {format.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 简化模型 */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">{t('generator.params.simplify')}</label>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setParams(prev => ({ ...prev, simplify: !prev.simplify }))}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                params.simplify ? 'bg-purple-600' : 'bg-gray-600'
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                params.simplify ? 'translate-x-6' : 'translate-x-0.5'
                              }`} />
                            </button>
                            <span className="text-sm text-gray-400">
                              {params.simplify ? '开启' : '关闭'}
                            </span>
                          </div>
                        </div>

                        {/* 纹理大小 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">{t('generator.params.textureSize')}</label>
                            <span className="text-sm text-purple-400">{params.texture_size}</span>
                          </div>
                          <input
                            type="range"
                            min={PARAM_RANGES.texture_size.min}
                            max={PARAM_RANGES.texture_size.max}
                            step={PARAM_RANGES.texture_size.step}
                            value={params.texture_size}
                            onChange={(e) => setParams(prev => ({
                              ...prev,
                              texture_size: parseInt(e.target.value)
                            }))}
                            className="w-full accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{PARAM_RANGES.texture_size.min}</span>
                            <span>{PARAM_RANGES.texture_size.max}</span>
                          </div>
                        </div>

                        {/* 最大面数 */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">{t('generator.params.maxFaces')}</label>
                            <span className="text-sm text-purple-400">{params.max_faces}</span>
                          </div>
                          <input
                            type="range"
                            min={PARAM_RANGES.max_faces.min}
                            max={PARAM_RANGES.max_faces.max}
                            step={PARAM_RANGES.max_faces.step}
                            value={params.max_faces}
                            onChange={(e) => setParams(prev => ({
                              ...prev,
                              max_faces: parseInt(e.target.value)
                            }))}
                            className="w-full accent-purple-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{PARAM_RANGES.max_faces.min}</span>
                            <span>{PARAM_RANGES.max_faces.max}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 重置按钮 */}
                    <div className="flex items-end">
                      <button
                        onClick={() => setParams({
                          seed: null,
                          sync_mode: false,
                          num_inference_steps: 20,
                          guidance_scale: 7.5,
                          width: 1024,
                          height: 1024,
                          negative_prompt: '',
                          num_images: 1,
                          strength: 0.8,
                          scale: 1.0,
                          num_samples: 1,
                          output_format: 'glb',
                          simplify: false,
                          texture_size: 1024,
                          max_faces: 10000
                        })}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>{t('generator.params.reset')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 生成按钮 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span>{t('generator.cost.label')}: <span className="text-purple-400 font-bold">3 {t('generator.cost.points')}</span></span>
                    {user && (
                      <span className={user.points >= 3 ? 'text-green-400' : 'text-red-400'}>
                        {t('generator.cost.remaining')}: {user.points} {t('generator.cost.points')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={
                      isGenerating ||
                      ((activeMethod === 'text' && !textInput) && uploadedImages.length === 0) ||
                      !isAuthenticated ||
                      (!!user && user.points < 3)
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>{t('generator.actions.generating')}</span>
                      </>
                    ) : (
                      <>
                        <Grid className="h-5 w-5" />
                        <span>
                          {!isAuthenticated ? t('generator.actions.loginRequired') :
                           (user && user.points < 3) ? t('generator.actions.pointsInsufficient') :
                           `${t('generator.actions.start')} ${currentModelConfig?.type === 'image-to-3d' ? t('generator.preview.modelTitle') : t('generator.preview.imageTitle')} ${t('generator.actions.deductionSuffix')}`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 导入模型区域 */}
            {activeTab === 'import' && (
              <div className="space-y-6">
                {/* 测试模型加载按钮 */}
                <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">{t('generator.import.quickTest')}</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        // 加载测试模型
                        const testModel: ModelFile = {
                          id: 'test-glb',
                          file: new File([''], 'test.glb'),
                          name: 'Test Model (GLB)',
                          size: 500000, // 假设500KB
                          type: 'glb',
                          url: '/test.glb'
                        }
                        setUploadedFiles([testModel])
                        setSelectedFile(testModel)
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {t('generator.import.loadTestGLB')}
                    </button>
                    <span className="text-gray-400 text-sm">{t('generator.import.tipLoadPreset')}</span>
                  </div>
                </div>

                <ModelUploader
                  onFilesChange={setUploadedFiles}
                  maxFiles={10}
                  maxSize={200}
                />

                {/* 文件列表 */}
                {uploadedFiles.length > 0 && (
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('generator.import.importedModels')}</h3>
                    <div className="grid gap-3">
                      {uploadedFiles.map(file => (
                        <div
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedFile?.id === file.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FolderOpen className="h-8 w-8 text-purple-400" />
                              <div>
                                <p className="text-white font-medium">{file.name}</p>
                                <p className="text-gray-400 text-sm">{file.type.toUpperCase()} • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            {selectedFile?.id === file.id && (
                              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                                {t('generator.import.selected')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右侧区域 */}
        {showPreview && (
          <div className="w-2/5 bg-black/20 flex flex-col">
            {/* 预览区域 */}
            <div className="flex-1 p-4">
              <div className="h-full bg-black/30 rounded-2xl border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {generatedModel ? t('generator.preview.modelTitle') :
                     generatedImages.length > 0 ? t('generator.preview.imageTitle') : t('generator.preview.defaultTitle')}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {generatedModel && (
                      <button
                        onClick={() => setViewerSettings(prev => ({ ...prev, autoRotate: !prev.autoRotate }))}
                        className={`p-2 rounded ${viewerSettings.autoRotate ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-[calc(100%-2.5rem)]">
                  {generatedImages.length > 0 ? (
                    /* 显示生成的图像 */
                    <div className="h-full overflow-y-auto">
                      <div className="grid grid-cols-1 gap-3">
                        {generatedImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={imageUrl}
                              alt={`生成的图像 ${index + 1}`}
                              width={400}
                              height={300}
                              className="w-full rounded-lg object-cover"
                              unoptimized
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-lg p-2 text-white text-xs">
                              {t('generator.preview.imageLabel')} {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    ) : (
                    <ModelViewer
                      src={generatedModel || selectedFile?.url || '/test.glb'}
                      className="w-full h-full"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 下载和保存按钮区域 */}
            <div className="h-20 p-4 border-t border-white/10">
              <div className="bg-black/30 rounded-2xl border border-white/10 p-4 h-full">
                <div className="flex items-center justify-between h-full">
                  <div className="text-sm font-medium text-white">
                    {t('generator.panel.title')}
                  </div>
                  <div className="flex items-center space-x-3">
                    {(generatedModel || generatedImages.length > 0 || selectedFile) && (
                      <>
                        {/* 保存按钮 */}
                        <button
                          onClick={handleSave}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                          title={t('common.save')}
                        >
                          <Save className="h-4 w-4" />
                          <span>{t('common.save')}</span>
                        </button>

                        {/* 下载按钮 */}
                        {generatedModel && (
                          <button
                            onClick={() => downloadModel(generatedModel)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                            title={t('generator.actions.downloadModelTitle')}
                          >
                            <Download className="h-4 w-4" />
                            <span>{t('common.download')}</span>
                          </button>
                        )}

                        {/* 图像下载按钮 */}
                        {generatedImages.length > 0 && (
                          <div className="flex space-x-2">
                            {generatedImages.map((imageUrl, index) => (
                              <button
                                key={index}
                                onClick={() => downloadImage(imageUrl, index)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                            title={`${t('generator.actions.downloadImageTitle')} ${index + 1}`}
                              >
                                图{index + 1}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 文件下载按钮 */}
                        {selectedFile && (
                          <button
                            onClick={() => {
                              if (selectedFile?.url) {
                                window.open(selectedFile.url, '_blank')
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                            title="查看文件"
                          >
                            <Download className="h-4 w-4" />
                            <span>{t('common.download')}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
