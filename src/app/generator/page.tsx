'use client'

import { useState, useRef } from 'react'
import { Upload, Type, Image as ImageIcon, Send, Download, Sparkles, RotateCcw, Play, Pause, X } from 'lucide-react'
import Image from 'next/image'
import Script from 'next/script'
import React from 'react'

type ModelViewerProps = React.HTMLAttributes<HTMLElement> & {
  src?: string
  [key: string]: unknown
}

const ModelViewer: React.FC<ModelViewerProps> = (props) => React.createElement('model-viewer', props)
import { useLanguage } from '../contexts/LanguageContext'
import Header from '../components/Header'

export default function Generator() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedModel, setGeneratedModel] = useState(false)
  const [savePending, setSavePending] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageNum, setImageNum] = useState<number>(1)
  const allowedAR = ['1:1','21:9','4:3','3:2','2:3','5:4','4:5','3:4','16:9','9:16'] as const
  type AR = typeof allowedAR[number]
  const [imageAR, setImageAR] = useState<AR>('1:1')
  const allowedOF = ['png','jpeg','webp'] as const
  type OF = typeof allowedOF[number]
  const [imageOF, setImageOF] = useState<OF>('png')
  const allowedTex = ['512','1024','2048'] as const
  type Tex = typeof allowedTex[number]
  const [texSize, setTexSize] = useState<Tex>('1024')
  const [simplify, setSimplify] = useState<number>(0.95)
  const [ssGuide, setSsGuide] = useState<number>(7.5)
  const [ssSteps, setSsSteps] = useState<number>(12)
  const [slatGuide, setSlatGuide] = useState<number>(3)
  const [slatSteps, setSlatSteps] = useState<number>(12)
  const [seed, setSeed] = useState<number | null>(null)
  const [imageGenPending, setImageGenPending] = useState(false)
  const [imageResults, setImageResults] = useState<string[]>([])
  const [threePending, setThreePending] = useState(false)
  const [meshUrl, setMeshUrl] = useState<string | null>(null)
  const [meshName, setMeshName] = useState<string | null>(null)
  const proxify = (u: string) => (u.startsWith('http') ? `/api/proxy?url=${encodeURIComponent(u)}` : u)
  const [imageError, setImageError] = useState<string | null>(null)
  const [threeError, setThreeError] = useState<string | null>(null)
  const [modelAssets, setModelAssets] = useState<{ format: string; url: string }[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const viewerRef = useRef<HTMLElement | null>(null)
  const [autoRotate, setAutoRotate] = useState<boolean>(true)
  const [rotSpeed, setRotSpeed] = useState<number>(20)
  const [shadowIntensity, setShadowIntensity] = useState<number>(1)
  const [shadowSoftness, setShadowSoftness] = useState<number>(0.6)
  const [fov, setFov] = useState<number>(45)
  const [bgColor, setBgColor] = useState<string>('#0f172a')
  const [bgMode, setBgMode] = useState<'solid'|'gradient'|'transparent'>('gradient')
  const [envPreset, setEnvPreset] = useState<'none'|'studio'|'sunrise'|'city'>('studio')
  const envUrl = (p: typeof envPreset) => p === 'studio' ? 'https://modelviewer.dev/shared-assets/environments/studio.hdr'
    : p === 'sunrise' ? 'https://modelviewer.dev/shared-assets/environments/spruit_sunrise_2k.hdr'
    : p === 'city' ? 'https://modelviewer.dev/shared-assets/environments/urban_street_2k.hdr'
    : undefined
  const extFromUrl = (u: string) => {
    try {
      const pathname = new URL(u, 'http://x').pathname
      const m = pathname.match(/\.([a-zA-Z0-9]+)$/)
      return m ? m[1].toLowerCase() : ''
    } catch {
      const m = u.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)
      return m ? m[1].toLowerCase() : ''
    }
  }
  const collectAssets = (raw: unknown) => {
    const out: { format: string; url: string }[] = []
    const seen = new Set<string>()
    const visit = (v: unknown) => {
      if (!v) return
      if (typeof v === 'string') {
        if (/^https?:/.test(v)) {
          const fmt = extFromUrl(v)
          if (['glb','gltf','obj','fbx'].includes(fmt)) {
            const key = v.split('?')[0]
            if (!seen.has(key)) {
              seen.add(key)
              out.push({ format: fmt, url: v })
            }
          }
        }
        return
      }
      if (Array.isArray(v)) v.forEach(visit)
      else if (typeof v === 'object' && v !== null) Object.values(v as Record<string, unknown>).forEach(visit)
    }
    visit(raw)
    return out
  }
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      await handleImageGenerate()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImageGenerate = async () => {
    try {
      setImageGenPending(true)
      setImageResults([])
      setImageError(null)
      const isEdit = activeTab === 'image' && imageUrls.length > 0
      const endpoint = isEdit ? '/api/fal/image-edit' : '/api/fal/image'
      const body = isEdit
        ? { prompt: textInput || 'edit', image_urls: imageUrls, num_images: imageNum, aspect_ratio: imageAR, output_format: imageOF }
        : { prompt: textInput || 'a 3d model concept', num_images: imageNum, aspect_ratio: imageAR, output_format: imageOF }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const err = typeof data?.error === 'string' ? data.error : 'unknown'
        setImageError(err)
        return
      }
      const imgs: string[] = Array.isArray(data?.images) ? data.images : []
      if (imgs.length === 0) {
        setImageError('empty')
        return
      }
      setImageResults(imgs)
    } finally {
      setImageGenPending(false)
    }
  }

  const handle3dGenerate = async (provider: 'free' | 'pro') => {
    try {
      setThreePending(true)
      setMeshUrl(null)
      setThreeError(null)
      const imgs = provider === 'free'
        ? (imageUrls.length > 0 ? [imageUrls[0]] : (imageResults.length > 0 ? [imageResults[0]] : []))
        : (imageUrls.length > 0 ? imageUrls : (imageResults.length > 0 ? imageResults.slice(0, 3) : []))
      if (imgs.length === 0) {
        setThreePending(false)
        return
      }
      const res = await fetch(`/api/fal/3d?provider=${provider}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_urls: imgs, texture_size: Number(texSize), mesh_simplify: Math.max(0.9, Math.min(1, simplify)), ...(provider === 'free' ? { ss_guidance_strength: ssGuide, ss_sampling_steps: ssSteps, slat_guidance_strength: slatGuide, slat_sampling_steps: slatSteps, ...(seed !== null ? { seed } : {}) } : {}) }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const err = typeof data?.error === 'string' ? data.error : 'unknown'
        setThreeError(err)
        return
      }
      const url = typeof data?.model_url === 'string' ? data.model_url : null
      const assets = collectAssets(data?.raw)
      const preferred = assets.find(a => a.format === 'glb' || a.format === 'gltf')?.url || url
      setMeshUrl(preferred || null)
      const fname = (data?.raw?.model_mesh?.file_name as string | undefined) || (preferred || url ? `model.${extFromUrl(preferred || url) || 'glb'}` : null)
      setMeshName(fname || null)
      if (url) {
        const fmt = extFromUrl(url)
        if (['glb','gltf','obj','fbx'].includes(fmt)) assets.unshift({ format: fmt, url })
      }
      setModelAssets(assets)
      if (preferred || url) setGeneratedModel(true)
    } finally {
      setThreePending(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const readers = files.map(f => new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(f)
    }))
    const urls = await Promise.all(readers).catch(() => [])
    setImageUrls(urls.filter(Boolean))
  }

  const removeImage = (idx: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== idx))
  }

  const clearImages = () => {
    setImageUrls([])
  }

  const handleDragStart = (idx: number) => {
    setDragIndex(idx)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) return
    setImageUrls(prev => {
      const next = [...prev]
      const [m] = next.splice(dragIndex, 1)
      next.splice(idx, 0, m)
      return next
    })
    setDragIndex(null)
  }

  const handleSave = async () => {
    try {
      setSavePending(true)
      const title = textInput?.trim() || '未命名作品'
      const res = await fetch('/api/me/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, model_url: meshUrl ?? undefined, model_file_name: meshName ?? undefined })
      })
      if (res.status === 401) {
        window.location.href = '/?redirect=/generator&login=1'
        return
      }
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.href) {
        window.location.href = data.href
      }
    } finally {
      setSavePending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <Header
        logoText="AI 3D Generator"
        logoIcon={<Sparkles className="h-8 w-8 text-purple-400" />}
      />
      <Script src="https://unpkg.com/@google/model-viewer@latest/dist/model-viewer.min.js" strategy="beforeInteractive" />

      {/* Main Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('generator.title')}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('generator.title.highlight')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('generator.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Section */}
            <div className="space-y-8">
              {/* Input Type Selector */}
              <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">{t('generator.input.title')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      activeTab === 'text'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Type className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-semibold">{t('generator.input.text')}</div>
                    <div className="text-sm opacity-75">{t('generator.input.text.desc')}</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('image')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      activeTab === 'image'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-semibold">{t('generator.input.image')}</div>
                    <div className="text-sm opacity-75">{t('generator.input.image.desc')}</div>
                  </button>
                  
                  
                </div>
              </div>

              {/* Input Area */}
              <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">{t('generator.input.text')}</h3>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t('generator.text.placeholder')}
                      className="w-full h-32 bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                    />
                    <div className="flex justify-start items-center">
                      <span className="text-gray-400 text-sm">{textInput.length}/500 {t('generator.text.characters')}</span>
                    </div>
                    {imageError && (
                      <div className="text-red-400 text-xs">{imageError === 'config' ? '图片生成配置缺失，请设置 FAL_KEY' : imageError === 'prompt' ? '请输入描述后再生成图片' : imageError === 'empty' ? '生成成功但未返回图片' : '图片生成失败'}</div>
                    )}
                  </div>
                )}
                
                {activeTab === 'image' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">{t('generator.input.image')}</h3>
                    <div onClick={triggerFileInput} className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-white mb-2">{t('generator.image.upload')}</p>
                      <p className="text-gray-400 text-sm">{t('generator.image.support')}</p>
                    </div>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFilesSelected} />
                    <div className="max-h-64 overflow-y-auto pr-2">
                      <div className="grid grid-cols-3 gap-2">
                      {imageUrls.length === 0 ? (
                        <div className="bg-gray-800/50 rounded-lg h-20 flex items-center justify-center text-gray-400 text-xs col-span-3">
                          {t('common.loading')}
                        </div>
                      ) : (
                        imageUrls.map((u, i) => (
                          <div
                            key={i}
                            className="bg-gray-900 rounded-lg h-32 md:h-40 overflow-hidden border border-gray-700 relative flex items-center justify-center"
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(i)}
                          >
                            <Image src={u} alt="upload" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-contain" unoptimized />
                            <button aria-label="删除图片" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                      </div>
                    </div>
                    {imageUrls.length > 0 && (
                      <div className="flex justify-end mt-2">
                        <button onClick={clearImages} className="text-xs text-gray-300 hover:text-white underline">
                          清空已上传图片
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                
              </div>

              {/* Generation Settings */}
              <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">生成设置</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-semibold mb-2">图片生成</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-white text-sm mb-1">数量</label>
                        <select value={imageNum} onChange={(e)=> setImageNum(Number(e.target.value))} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white">
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-1">比例</label>
                        <select value={imageAR} onChange={(e)=> { const val = e.target.value as string; setImageAR(allowedAR.includes(val as AR) ? (val as AR) : '1:1') }} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white">
                          <option value="1:1">1:1</option>
                          <option value="16:9">16:9</option>
                          <option value="9:16">9:16</option>
                          <option value="4:3">4:3</option>
                          <option value="3:2">3:2</option>
                          <option value="2:3">2:3</option>
                          <option value="5:4">5:4</option>
                          <option value="4:5">4:5</option>
                          <option value="3:4">3:4</option>
                          <option value="21:9">21:9</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-1">格式</label>
                        <select value={imageOF} onChange={(e)=> { const val = e.target.value as string; setImageOF(allowedOF.includes(val as OF) ? (val as OF) : 'png') }} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white">
                          <option value="png">PNG</option>
                          <option value="jpeg">JPEG</option>
                          <option value="webp">WEBP</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">3D生成</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-white text-sm mb-1">纹理分辨率</label>
                        <select value={texSize} onChange={(e)=> { const val = e.target.value as string; setTexSize(allowedTex.includes(val as Tex) ? (val as Tex) : '1024') }} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white">
                          <option value="512">512</option>
                          <option value="1024">1024</option>
                          <option value="2048">2048</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white text-sm mb-1">网格简化</label>
                        <input type="range" min={0.9} max={1} step={0.01} value={simplify} onChange={(e)=> setSimplify(parseFloat(e.target.value))} className="w-full" />
                        <div className="text-gray-400 text-xs mt-1">{simplify.toFixed(2)}</div>
                      </div>
                  <div>
                    <label className="block text-white text-sm mb-1">稀疏结构强度</label>
                    <input type="range" min={0} max={10} step={0.1} value={ssGuide} onChange={(e)=> setSsGuide(parseFloat(e.target.value))} className="w-full" />
                    <div className="text-gray-400 text-xs mt-1">{ssGuide.toFixed(1)}</div>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1">稀疏采样步数</label>
                    <input type="number" min={1} max={50} value={ssSteps} onChange={(e)=> setSsSteps(parseInt(e.target.value || '0', 10))} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1">结构潜导强度</label>
                    <input type="range" min={0} max={10} step={0.1} value={slatGuide} onChange={(e)=> setSlatGuide(parseFloat(e.target.value))} className="w-full" />
                    <div className="text-gray-400 text-xs mt-1">{slatGuide.toFixed(1)}</div>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1">结构潜采样步数</label>
                    <input type="number" min={1} max={50} value={slatSteps} onChange={(e)=> setSlatSteps(parseInt(e.target.value || '0', 10))} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-1">随机种子</label>
                    <input type="number" value={seed ?? ''} onChange={(e)=> { const v = e.target.value; setSeed(v === '' ? null : parseInt(v, 10)) }} className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                  </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!textInput && activeTab === 'text')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('generator.generating')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>{t('generator.generate')}</span>
                  </>
                )}
              </button>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <button onClick={handleImageGenerate} disabled={imageGenPending} className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors">
                    {imageGenPending ? '生成图片中...' : '生成图片'}
                  </button>
                  <button onClick={() => handle3dGenerate('free')} disabled={threePending} className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors">
                    {threePending ? '生成3D中...' : '生成3D（免费）'}
                  </button>
                  <button onClick={() => handle3dGenerate('pro')} disabled={threePending} className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors">
                    {threePending ? '生成3D中...' : '生成3D（付费）'}
                  </button>
                  {threeError && (
                    <div className="text-red-400 text-xs col-span-3">{threeError === 'config' ? '3D生成配置缺失，请设置 FAL_KEY' : threeError === 'input' ? '请先生成或上传图片，再生成3D模型' : '3D生成失败'}</div>
                  )}
                </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">{t('generator.preview.title')}</h3>
                  <div className="flex space-x-2">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
                      <div className="text-xs font-bold">360°</div>
                    </button>
                  </div>
                </div>
                
                {meshUrl ? (
                  <div className="relative">
                    <ModelViewer
                      ref={viewerRef as unknown as React.Ref<HTMLElement>}
                      src={meshUrl ? proxify(meshUrl) : ''}
                      camera-controls
                      auto-rotate={autoRotate}
                      rotation-per-second={`${rotSpeed}deg`}
                      shadow-intensity={shadowIntensity}
                      shadow-softness={shadowSoftness}
                      field-of-view={`${fov}deg`}
                      environment-image={envUrl(envPreset)}
                      style={{ width: '100%', height: '24rem', background: bgMode === 'solid' ? bgColor : bgMode === 'gradient' ? 'linear-gradient(135deg,#0f172a,#1e114f)' : 'transparent', borderRadius: '0.75rem' }}
                    />
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md rounded-lg p-3 text-white space-y-2 w-64 border border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">自动旋转</span>
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={autoRotate} onChange={(e)=> setAutoRotate(e.target.checked)} className="mr-2" />
                        </label>
                      </div>
                      <div>
                        <div className="text-xs text-gray-300 mb-1">旋转速度</div>
                        <input type="range" min={-60} max={60} step={1} value={rotSpeed} onChange={(e)=> setRotSpeed(parseInt(e.target.value,10))} className="w-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-300 mb-1">阴影强度</div>
                          <input type="range" min={0} max={2} step={0.05} value={shadowIntensity} onChange={(e)=> setShadowIntensity(parseFloat(e.target.value))} className="w-full" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-300 mb-1">阴影柔和</div>
                          <input type="range" min={0} max={1} step={0.05} value={shadowSoftness} onChange={(e)=> setShadowSoftness(parseFloat(e.target.value))} className="w-full" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-300 mb-1">视场 FOV</div>
                          <input type="range" min={20} max={80} step={1} value={fov} onChange={(e)=> setFov(parseInt(e.target.value,10))} className="w-full" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-300 mb-1">环境光</div>
                          <select value={envPreset} onChange={(e)=> setEnvPreset(e.target.value as 'none'|'studio'|'sunrise'|'city')} className="w-full bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-white">
                            <option value="studio">Studio</option>
                            <option value="sunrise">Sunrise</option>
                            <option value="city">City</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={()=> { setBgMode('gradient'); setBgColor('#0f172a') }} className="bg-gradient-to-br from-purple-900 to-slate-900 text-white py-1 rounded">渐变</button>
                        <button onClick={()=> setBgMode('solid')} className="bg-gray-700 text-white py-1 rounded">纯色</button>
                        <button onClick={()=> setBgMode('transparent')} className="bg-black text-white py-1 rounded">透明</button>
                      </div>
                      {bgMode === 'solid' && (
                        <input type="color" value={bgColor} onChange={(e)=> setBgColor(e.target.value)} className="w-full h-8" />
                      )}
                      <div className="flex justify-between">
                        <button onClick={()=> { setAutoRotate(true); setRotSpeed(20); setShadowIntensity(1); setShadowSoftness(0.6); setFov(45); setEnvPreset('studio'); setBgMode('gradient'); setBgColor('#0f172a') }} className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs">重置视图</button>
                        <button onClick={()=> viewerRef.current && (viewerRef.current as any).reset?.()} className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs">重置相机</button>
                      </div>
                    </div>
                  </div>
                ) : imageResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imageResults.map((u, i) => (
                      <div key={i} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 relative h-40">
                        <Image src={proxify(u)} alt="result" fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" unoptimized />
                        <a href={proxify(u)} download={`image-${i + 1}.${extFromUrl(u) || imageOF}`} className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs">
                          {t('generator.actions.downloadOriginal')}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : generatedModel ? (
                  <div className="relative">
                    <div className="bg-gray-800/50 rounded-xl h-96 flex items-center justify-center border border-gray-700">
                      <div className="text-center">
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-32 h-32 rounded-2xl mx-auto mb-4 flex items-center justify-center transform rotate-12">
                          <div className="bg-white w-16 h-16 rounded-lg"></div>
                        </div>
                        <p className="text-white font-semibold">{t('generator.preview.generated')}</p>
                        <p className="text-gray-400 text-sm">{t('generator.preview.drag')}</p>
                      </div>
                    </div>
                    
                    {/* Animation Controls */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/50 backdrop-blur-md rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-colors">
                            <Play className="h-4 w-4" />
                          </button>
                          <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors">
                            <Pause className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex space-x-1">
                          <button className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors">
                            {t('common.on')}
                          </button>
                          <button className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors">
                            {t('common.preview')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-xl h-96 flex items-center justify-center border border-gray-700">
                    <div className="text-center">
                      <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">{t('generator.preview.waiting')}</p>
                      <p className="text-gray-400 text-sm">{t('generator.preview.waiting.desc')}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {generatedModel && (
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4">{t('generator.info.title')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">{t('generator.info.polygons')}</div>
                        <div className="text-white font-semibold">12,450</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">{t('generator.info.vertices')}</div>
                        <div className="text-white font-semibold">8,230</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">{t('generator.info.texture')}</div>
                        <div className="text-white font-semibold">2K</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">{t('generator.info.size')}</div>
                        <div className="text-white font-semibold">2.3MB</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {meshUrl ? (
                      <a href={meshUrl ? `/api/proxy?url=${encodeURIComponent(meshUrl)}${meshName ? `&filename=${encodeURIComponent(meshName)}` : ''}` : '#'} download={meshName || undefined} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <Download className="h-5 w-5" />
                        <span>{t('generator.actions.download')}</span>
                      </a>
                    ) : (
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <Download className="h-5 w-5" />
                        <span>{t('generator.actions.download')}</span>
                      </button>
                    )}
                    {modelAssets.length > 0 && (
                      <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-lg font-semibold text-white mb-4">{t('generator.export.title')}</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {modelAssets.map((a, idx) => (
                            <a key={idx} href={`/api/proxy?url=${encodeURIComponent(a.url)}&filename=${encodeURIComponent(`model.${a.format}`)}`} download={`model.${a.format}`} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                              {a.format.toUpperCase()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <button onClick={handleSave} disabled={savePending} className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors">
                      {savePending ? '保存中...' : '保存到作品'}
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                        {t('generator.actions.edit')}
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                        {t('generator.actions.share')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">AI 3D Generator</span>
              </div>
              <p className="text-gray-400">{t('generator.footer.description')}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('generator.footer.generationMethods')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('generator.footer.textGeneration')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.imageTo3d')}</a></li>
                
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('generator.footer.tools')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('generator.footer.modelEditor')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.materialLibrary')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.exportSettings')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('generator.footer.help')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('generator.footer.userGuide')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.apiDocs')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.techSupport')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI 3D Generator. {t('generator.footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
