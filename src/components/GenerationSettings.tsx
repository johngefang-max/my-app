'use client'

import { useState } from 'react'
import { Settings, Image, Sparkles, Layers, Palette, Zap } from 'lucide-react'

interface GenerationSettingsProps {
  mode: 'text-to-image' | 'image-edit' | 'text-to-3d' | 'image-to-3d'
  settings: any
  onSettingsChange: (settings: any) => void
}

export default function GenerationSettings({
  mode,
  settings,
  onSettingsChange
}: GenerationSettingsProps) {
  const [advancedMode, setAdvancedMode] = useState(false)

  // 文本转图像设置
  const textToImageSettings = {
    num_images: 1,
    aspect_ratio: '1:1',
    output_format: 'png',
    guidance_scale: 7.5,
    num_inference_steps: 50,
    seed: null,
    negative_prompt: '',
    scheduler: 'DPMSolverMultistepScheduler'
  }

  // 图像编辑设置
  const imageEditSettings = {
    num_images: 1,
    aspect_ratio: '1:1',
    output_format: 'png',
    guidance_scale: 7.5,
    num_inference_steps: 50,
    seed: null,
    prompt_strength: 0.8,
    negative_prompt: ''
  }

  // 文本转3D设置 - 免费版
  const textTo3DSettings = {
    texture_size: 1024,
    mesh_simplify: 0.95,
    ss_guidance_strength: 7.5,
    ss_sampling_steps: 12,
    slat_guidance_strength: 3,
    slat_sampling_steps: 12,
    seed: null
  }

  // 文本转3D设置 - 专业版
  const textTo3DProSettings = {
    texture_size: 2048,
    mesh_simplify: 0.95,
    processing_mode: 'high_quality'
  }

  // 图像转3D设置 - 免费版
  const imageTo3DSettings = {
    texture_size: 1024,
    mesh_simplify: 0.95,
    ss_guidance_strength: 7.5,
    ss_sampling_steps: 12,
    slat_guidance_strength: 3,
    slat_sampling_steps: 12,
    seed: null
  }

  // 图像转3D设置 - 专业版
  const imageTo3DProSettings = {
    texture_size: 2048,
    mesh_simplify: 0.95,
    processing_mode: 'high_quality'
  }

  const getDefaultSettings = () => {
    switch (mode) {
      case 'text-to-image':
        return textToImageSettings
      case 'image-edit':
        return imageEditSettings
      case 'text-to-3d':
        return textToImageSettings
      case 'image-to-3d':
        return imageTo3DSettings
      default:
        return textToImageSettings
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const currentSettings = settings || getDefaultSettings()

  // 文本转图像UI
  if (mode === 'text-to-image') {
    return (
      <div className="bg-black/30 rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">图像生成设置</h3>
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {advancedMode ? '基础设置' : '高级设置'}
          </button>
        </div>

        {/* 基础设置 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-white text-sm mb-2">生成数量</label>
            <select
              value={currentSettings.num_images}
              onChange={(e) => handleSettingChange('num_images', parseInt(e.target.value))}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value={1}>1张</option>
              <option value={2}>2张</option>
              <option value={3}>3张</option>
              <option value={4}>4张</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">宽高比</label>
            <select
              value={currentSettings.aspect_ratio}
              onChange={(e) => handleSettingChange('aspect_ratio', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="1:1">1:1</option>
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="4:3">4:3</option>
              <option value="3:2">3:2</option>
              <option value="2:3">2:3</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">输出格式</label>
            <select
              value={currentSettings.output_format}
              onChange={(e) => handleSettingChange('output_format', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">随机种子</label>
            <input
              type="number"
              value={currentSettings.seed || ''}
              onChange={(e) => handleSettingChange('seed', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="留空自动生成"
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>

        {/* 高级设置 */}
        {advancedMode && (
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm mb-2">引导强度 ({currentSettings.guidance_scale})</label>
              <input
                type="range"
                min={1}
                max={20}
                step={0.1}
                value={currentSettings.guidance_scale}
                onChange={(e) => handleSettingChange('guidance_scale', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">推理步数 ({currentSettings.num_inference_steps})</label>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={currentSettings.num_inference_steps}
                onChange={(e) => handleSettingChange('num_inference_steps', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">负面提示</label>
              <textarea
                value={currentSettings.negative_prompt || ''}
                onChange={(e) => handleSettingChange('negative_prompt', e.target.value)}
                placeholder="描述不希望出现的元素..."
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">调度器</label>
              <select
                value={currentSettings.scheduler}
                onChange={(e) => handleSettingChange('scheduler', e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="DPMSolverMultistepScheduler">DPM Solver</option>
                <option value="DDIMScheduler">DDIM</option>
                <option value="EulerAncestralDiscreteScheduler">Euler</option>
                <option value="EulerDiscreteScheduler">Euler Discrete</option>
              </select>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 图像编辑UI
  if (mode === 'image-edit') {
    return (
      <div className="bg-black/30 rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">图像编辑设置</h3>
          <div className="flex items-center space-x-2">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1">
              <span className="text-blue-400 text-sm">编辑模式</span>
            </div>
            <button
              onClick={() => setAdvancedMode(!advancedMode)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              {advancedMode ? '基础设置' : '高级设置'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white text-sm mb-2">生成数量</label>
            <select
              value={currentSettings.num_images}
              onChange={(e) => handleSettingChange('num_images', parseInt(e.target.value))}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value={1}>1张</option>
              <option value={2}>2张</option>
              <option value={3}>3张</option>
              <option value={4}>4张</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">编辑强度</label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={currentSettings.prompt_strength}
              onChange={(e) => handleSettingChange('prompt_strength', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-gray-400 text-xs mt-1">{currentSettings.prompt_strength}</div>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">输出格式</label>
            <select
              value={currentSettings.output_format}
              onChange={(e) => handleSettingChange('output_format', e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
        </div>

        {advancedMode && (
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm mb-2">引导强度 ({currentSettings.guidance_scale})</label>
              <input
                type="range"
                min={1}
                max={20}
                step={0.1}
                value={currentSettings.guidance_scale}
                onChange={(e) => handleSettingChange('guidance_scale', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">推理步数 ({currentSettings.num_inference_steps})</label>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={currentSettings.num_inference_steps}
                onChange={(e) => handleSettingChange('num_inference_steps', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">负面提示</label>
              <textarea
                value={currentSettings.negative_prompt || ''}
                onChange={(e) => handleSettingChange('negative_prompt', e.target.value)}
                placeholder="描述不希望保留的元素..."
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none h-20"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // 文本转3D UI
  if (mode === 'text-to-3d') {
    return (
      <div className="bg-black/30 rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">3D模型生成设置</h3>
          <div className="flex items-center space-x-2">
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1">
              <span className="text-purple-400 text-sm">文本生成</span>
            </div>
            <button
              onClick={() => setAdvancedMode(!advancedMode)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              {advancedMode ? '基础设置' : '高级设置'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm mb-2">生成质量</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSettingChange('quality', 'free')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentSettings.quality === 'free' || !currentSettings.quality
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>免费</span>
                </div>
              </button>
              <button
                onClick={() => handleSettingChange('quality', 'pro')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentSettings.quality === 'pro'
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>专业</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              纹理分辨率 {currentSettings.texture_size && `(${currentSettings.texture_size}x${currentSettings.texture_size})`}
            </label>
            <select
              value={currentSettings.texture_size || 1024}
              onChange={(e) => handleSettingChange('texture_size', parseInt(e.target.value))}
              disabled={currentSettings.quality === 'pro'}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white disabled:opacity-50"
            >
              <option value={512}>512x512</option>
              <option value={1024}>1024x1024</option>
              <option value={2048}>2048x2048</option>
            </select>
            {currentSettings.quality === 'pro' && (
              <p className="text-gray-400 text-xs mt-1">专业版自动使用最高分辨率</p>
            )}
          </div>
        </div>

        {currentSettings.quality === 'free' && advancedMode && (
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm mb-2">网格简化 ({currentSettings.mesh_simplify})</label>
              <input
                type="range"
                min={0.9}
                max={1}
                step={0.01}
                value={currentSettings.mesh_simplify}
                onChange={(e) => handleSettingChange('mesh_simplify', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">稀疏结构强度 ({currentSettings.ss_guidance_strength})</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={currentSettings.ss_guidance_strength}
                onChange={(e) => handleSettingChange('ss_guidance_strength', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">稀疏采样步数 ({currentSettings.ss_sampling_steps})</label>
              <input
                type="number"
                min={1}
                max={50}
                value={currentSettings.ss_sampling_steps}
                onChange={(e) => handleSettingChange('ss_sampling_steps', parseInt(e.target.value))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">结构潜导强度 ({currentSettings.slat_guidance_strength})</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={currentSettings.slat_guidance_strength}
                onChange={(e) => handleSettingChange('slat_guidance_strength', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">结构潜采样步数 ({currentSettings.slat_sampling_steps})</label>
              <input
                type="number"
                min={1}
                max={50}
                value={currentSettings.slat_sampling_steps}
                onChange={(e) => handleSettingChange('slat_sampling_steps', parseInt(e.target.value))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // 图像转3D UI
  if (mode === 'image-to-3d') {
    return (
      <div className="bg-black/30 rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">3D模型生成设置</h3>
          <div className="flex items-center space-x-2">
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1">
              <span className="text-purple-400 text-sm">图像生成</span>
            </div>
            <button
              onClick={() => setAdvancedMode(!advancedMode)}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              {advancedMode ? '基础设置' : '高级设置'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm mb-2">生成质量</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSettingChange('quality', 'free')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentSettings.quality === 'free' || !currentSettings.quality
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>免费</span>
                </div>
              </button>
              <button
                onClick={() => handleSettingChange('quality', 'pro')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  currentSettings.quality === 'pro'
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>专业</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              纹理分辨率 {currentSettings.texture_size && `(${currentSettings.texture_size}x${currentSettings.texture_size})`}
            </label>
            <select
              value={currentSettings.texture_size || 1024}
              onChange={(e) => handleSettingChange('texture_size', parseInt(e.target.value))}
              disabled={currentSettings.quality === 'pro'}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white disabled:opacity-50"
            >
              <option value={512}>512x512</option>
              <option value={1024}>1024x1024</option>
              <option value={2048}>2048x2048</option>
            </select>
            {currentSettings.quality === 'pro' && (
              <p className="text-gray-400 text-xs mt-1">专业版自动使用最高分辨率</p>
            )}
          </div>
        </div>

        {currentSettings.quality === 'free' && advancedMode && (
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm mb-2">网格简化 ({currentSettings.mesh_simplify})</label>
              <input
                type="range"
                min={0.9}
                max={1}
                step={0.01}
                value={currentSettings.mesh_simplify}
                onChange={(e) => handleSettingChange('mesh_simplify', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">稀疏结构强度 ({currentSettings.ss_guidance_strength})</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={currentSettings.ss_guidance_strength}
                onChange={(e) => handleSettingChange('ss_guidance_strength', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">稀疏采样步数 ({currentSettings.ss_sampling_steps})</label>
              <input
                type="number"
                min={1}
                max={50}
                value={currentSettings.ss_sampling_steps}
                onChange={(e) => handleSettingChange('ss_sampling_steps', parseInt(e.target.value))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">结构潜导强度 ({currentSettings.slat_guidance_strength})</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={currentSettings.slat_guidance_strength}
                onChange={(e) => handleSettingChange('slat_guidance_strength', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-white text-sm mb-2">结构潜采样步数 ({currentSettings.slat_sampling_steps})</label>
              <input
                type="number"
                min={1}
                max={50}
                value={currentSettings.slat_sampling_steps}
                onChange={(e) => handleSettingChange('slat_sampling_steps', parseInt(e.target.value))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}