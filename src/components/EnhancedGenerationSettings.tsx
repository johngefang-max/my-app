'use client'

import { useState } from 'react'
import {
  Settings, Image, Sparkles, Layers, Palette, Zap, Grid, Sliders,
  Shield, Clock, RefreshCw, Camera, Download, Eye, EyeOff
} from 'lucide-react'
import { FAL_APIS, PARAM_OPTIONS, PARAM_RANGES, type FalApiConfig } from '@/config/fal-api'

interface GenerationSettingsProps {
  mode: 'text-to-image' | 'image-edit' | 'image-to-3d' | 'text-to-3d'
  settings: FalApiConfig
  onSettingsChange: (settings: FalApiConfig) => void
  selectedModel?: string
  onModelChange?: (modelId: string) => void
}

export default function EnhancedGenerationSettings({
  mode,
  settings,
  onSettingsChange,
  selectedModel,
  onModelChange
}: GenerationSettingsProps) {
  const [advancedMode, setAdvancedMode] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  // 获取当前模式可用的模型
  const availableModels = Object.entries(FAL_APIS).filter(
    ([_, config]) => config.type === mode
  )

  const handleSettingChange = (key: keyof FalApiConfig, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const handleModelChange = (modelId: string) => {
    onModelChange?.(modelId)
    const modelConfig = FAL_APIS[modelId as keyof typeof FAL_APIS]
    if (modelConfig) {
      onSettingsChange({
        ...settings,
        ...modelConfig.default_params
      })
    }
  }

  // 预设配置
  const presets = {
    fast: {
      name: '快速生成',
      icon: Zap,
      settings: {
        num_inference_steps: 4,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false
      }
    },
    balanced: {
      name: '平衡模式',
      icon: Grid,
      settings: {
        num_inference_steps: 20,
        guidance_scale: 7.5,
        num_images: 1,
        enable_safety_checker: true
      }
    },
    quality: {
      name: '高质量',
      icon: Sparkles,
      settings: {
        num_inference_steps: 50,
        guidance_scale: 7.5,
        num_images: 1,
        enable_safety_checker: true,
        sync_mode: true
      }
    }
  }

  const applyPreset = (preset: typeof presets[keyof typeof presets]) => {
    onSettingsChange({
      ...settings,
      ...preset.settings
    })
  }

  // 模型选择器
  const ModelSelector = () => (
    <div className="space-y-3">
      <label className="block text-white text-sm font-medium">AI模型选择</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {availableModels.map(([modelId, config]) => (
          <button
            key={modelId}
            onClick={() => handleModelChange(modelId)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedModel === modelId
                ? 'border-purple-500 bg-purple-500/10 text-white'
                : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
            }`}
          >
            <div className="font-medium text-sm">{config.name}</div>
            <div className="text-xs opacity-75 mt-1">{config.type}</div>
          </button>
        ))}
      </div>
    </div>
  )

  // 参数控件组件
  const RangeControl = ({
    param,
    label,
    icon: Icon
  }: {
    param: keyof FalApiConfig
    label: string
    icon: any
  }) => {
    const range = PARAM_RANGES[param as keyof typeof PARAM_RANGES]
    const value = settings[param] as number || range.default

    if (!range) return null

    return (
      <div>
        <label className="block text-white text-sm mb-2 flex items-center space-x-2">
          <Icon className="h-4 w-4" />
          <span>{label} ({value})</span>
        </label>
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={range.step}
          value={value}
          onChange={(e) => handleSettingChange(param, parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    )
  }

  const SelectControl = ({
    param,
    label,
    icon: Icon
  }: {
    param: keyof FalApiConfig
    label: string
    icon: any
  }) => {
    const options = PARAM_OPTIONS[param as keyof typeof PARAM_OPTIONS]
    const value = settings[param] as string || ''

    if (!options) return null

    return (
      <div>
        <label className="block text-white text-sm mb-2 flex items-center space-x-2">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </label>
        <select
          value={value}
          onChange={(e) => handleSettingChange(param, e.target.value)}
          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    )
  }

  const NumberControl = ({
    param,
    label,
    icon: Icon,
    min,
    max
  }: {
    param: keyof FalApiConfig
    label: string
    icon: any
    min?: number
    max?: number
  }) => {
    const range = PARAM_RANGES[param as keyof typeof PARAM_RANGES]
    const value = settings[param] as number || range?.default || 1

    return (
      <div>
        <label className="block text-white text-sm mb-2 flex items-center space-x-2">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </label>
        <input
          type="number"
          min={min ?? range?.min}
          max={max ?? range?.max}
          step={range?.step || 1}
          value={value}
          onChange={(e) => handleSettingChange(param, parseInt(e.target.value) || 0)}
          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
        />
      </div>
    )
  }

  // 文本输入控件
  const TextAreaControl = ({
    param,
    label,
    placeholder,
    icon: Icon
  }: {
    param: keyof FalApiConfig
    label: string
    placeholder: string
    icon: any
  }) => (
    <div>
      <label className="block text-white text-sm mb-2 flex items-center space-x-2">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </label>
      <textarea
        value={settings[param] as string || ''}
        onChange={(e) => handleSettingChange(param, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none h-20 focus:outline-none focus:border-purple-500"
      />
    </div>
  )

  // 开关控件
  const ToggleControl = ({
    param,
    label,
    icon: Icon
  }: {
    param: keyof FalApiConfig
    label: string
    icon: any
  }) => {
    const value = Boolean(settings[param])

    return (
      <div className="flex items-center justify-between">
        <label className="text-white text-sm flex items-center space-x-2">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </label>
        <button
          onClick={() => handleSettingChange(param, !value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value ? 'bg-purple-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-black/30 rounded-2xl p-6 border border-white/10 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>
            {mode === 'text-to-image' && '图像生成设置'}
            {mode === 'image-edit' && '图像编辑设置'}
            {mode === 'image-to-3d' && '3D模型生成设置'}
            {mode === 'text-to-3d' && '文本转3D设置'}
          </span>
        </h3>
        <div className="flex items-center space-x-3">
          {/* 预设按钮 */}
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`p-2 rounded-lg transition-colors ${
              showPresets
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="预设配置"
          >
            <Sliders className="h-4 w-4" />
          </button>

          {/* 高级设置切换 */}
          <button
            onClick={() => setAdvancedMode(!advancedMode)}
            className={`p-2 rounded-lg transition-colors ${
              advancedMode
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="高级设置"
          >
            {advancedMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 预设配置 */}
      {showPresets && (
        <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
          <label className="text-white text-sm font-medium">快速预设</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(presets).map(([key, preset]) => {
              const Icon = preset.icon
              return (
                <button
                  key={key}
                  onClick={() => applyPreset(preset)}
                  className="p-3 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{preset.name}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 模型选择 */}
      <ModelSelector />

      {/* 基础参数 */}
      <div className="space-y-4">
        <h4 className="text-white text-sm font-medium flex items-center space-x-2">
          <Grid className="h-4 w-4" />
          <span>基础参数</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(mode === 'text-to-image' || mode === 'image-edit') && (
            <>
              <NumberControl param="num_images" label="生成数量" icon={Image} min={1} max={4} />
              <SelectControl param="aspect_ratio" label="宽高比" icon={Camera} />
              <SelectControl param="output_format" label="输出格式" icon={Download} />
              <NumberControl param="seed" label="随机种子" icon={RefreshCw} min={0} max={999999999} />
            </>
          )}

          {mode === 'text-to-3d' && (
            <>
              <SelectControl param="output_format_3d" label="3D格式" icon={Layers} />
              <SelectControl param="processing_mode" label="处理模式" icon={Zap} />
            </>
          )}

          {(mode === 'image-to-3d' || mode === 'text-to-3d') && (
            <>
              <SelectControl param="texture_size" label="纹理大小" icon={Palette} />
              <RangeControl param="mesh_simplify" label="网格简化" icon={Grid} />
            </>
          )}
        </div>
      </div>

      {/* 高级参数 */}
      {advancedMode && (
        <div className="space-y-4">
          <h4 className="text-white text-sm font-medium flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>高级参数</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(mode === 'text-to-image' || mode === 'image-edit') && (
              <>
                <RangeControl param="guidance_scale" label="引导强度" icon={Zap} />
                <RangeControl param="num_inference_steps" label="推理步数" icon={Clock} />
                <RangeControl param="prompt_strength" label="提示强度" icon={Sparkles} />
                <RangeControl param="strength" label="编辑强度" icon={Settings} />
                <RangeControl param="safety_tolerance" label="安全等级" icon={Shield} />
                <SelectControl param="scheduler" label="调度器" icon={RefreshCw} />
              </>
            )}

            {(mode === 'image-to-3d' || mode === 'text-to-3d') && (
              <>
                <RangeControl param="ss_guidance_strength" label="稀疏结构强度" icon={Layers} />
                <NumberControl param="ss_sampling_steps" label="稀疏采样步数" icon={Clock} />
                <RangeControl param="slat_guidance_strength" label="结构潜导强度" icon={Grid} />
                <NumberControl param="slat_sampling_steps" label="结构潜采样步数" icon={Clock} />
              </>
            )}

            {/* 通用高级参数 */}
            <ToggleControl param="enable_safety_checker" label="安全检查" icon={Shield} />
            <ToggleControl param="sync_mode" label="同步模式" icon={RefreshCw} />
            <NumberControl param="num_attempts" label="尝试次数" icon={RefreshCw} />
            <NumberControl param="timeout" label="超时时间(秒)" icon={Clock} />
          </div>

          {/* 负面提示词 */}
          {(mode === 'text-to-image' || mode === 'image-edit') && (
            <TextAreaControl
              param="negative_prompt"
              label="负面提示词"
              placeholder="描述不希望出现的元素，例如：blurry, low quality, distorted..."
              icon={EyeOff}
            />
          )}
        </div>
      )}

      {/* 当前配置预览 */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white text-sm font-medium">当前配置</h4>
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(settings, null, 2))}
            className="text-gray-400 hover:text-white transition-colors text-xs"
          >
            复制配置
          </button>
        </div>
        <pre className="text-gray-400 text-xs overflow-x-auto">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>
    </div>
  )
}