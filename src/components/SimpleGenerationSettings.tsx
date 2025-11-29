'use client'

import { useState } from 'react'
import {
  Settings, Image, Sparkles, Layers, Sliders,
  Camera, Download, Eye, EyeOff
} from 'lucide-react'
import { FAL_APIS, PARAM_OPTIONS, PARAM_RANGES, type FalApiConfig } from '@/config/fal-api'

interface GenerationSettingsProps {
  mode: 'text-to-image' | 'image-edit' | 'image-to-3d' | 'text-to-3d'
  settings: FalApiConfig
  onSettingsChange: (settings: FalApiConfig) => void
  selectedModel?: string
  onModelChange?: (modelId: string) => void
}

export default function SimpleGenerationSettings({
  mode,
  settings,
  onSettingsChange,
  selectedModel,
  onModelChange
}: GenerationSettingsProps) {
  const [advancedMode, setAdvancedMode] = useState(false)

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
      <div className="space-y-2">
        <label className="block text-white text-sm font-medium flex items-center space-x-2">
          <Icon className="h-4 w-4" />
          <span>{label} ({value.toFixed(1)})</span>
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
        <div className="flex justify-between text-xs text-gray-400">
          <span>{range.min}</span>
          <span>{range.max}</span>
        </div>
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
      <div className="space-y-2">
        <label className="block text-white text-sm font-medium flex items-center space-x-2">
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
      <div className="space-y-2">
        <label className="block text-white text-sm font-medium flex items-center space-x-2">
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

  return (
    <div className="bg-black/30 rounded-2xl p-6 border border-white/10 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>
            {mode === 'text-to-image' && '图像生成设置'}
            {mode === 'image-edit' && '图像编辑设置'}
            {(mode === 'image-to-3d' || mode === 'text-to-3d') && '3D模型生成设置'}
          </span>
        </h3>
        <div className="flex items-center space-x-3">
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

      {/* 模型选择 */}
      <div className="space-y-3">
        <label className="block text-white text-sm font-medium">选择AI模型</label>
        <div className="grid grid-cols-1 gap-3">
          {availableModels.map(([modelId, config]) => (
            <button
              key={modelId}
              onClick={() => handleModelChange(modelId)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedModel === modelId
                  ? 'border-purple-500 bg-purple-500/10 text-white'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="font-medium text-sm">{config.name}</div>
              <div className="text-xs opacity-75 mt-1">{modelId}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 基础参数 */}
      <div className="space-y-4">
        <h4 className="text-white text-sm font-medium">基础参数</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 通用参数 */}
          <NumberControl param="seed" label="随机种子" icon={Settings} min={0} max={999999999} />

          {/* 图像生成参数 */}
          {(mode === 'text-to-image' || mode === 'image-edit') && (
            <RangeControl param="num_inference_steps" label="推理步数" icon={Camera} />
          )}

          {(mode === 'text-to-image' || mode === 'image-edit') && (
            <RangeControl param="guidance_scale" label="引导强度" icon={Sparkles} />
          )}

          {/* 3D生成参数 */}
          {(mode === 'image-to-3d' || mode === 'text-to-3d') && (
            <RangeControl param="scale" label="模型缩放" icon={Layers} />
          )}

          {(mode === 'image-to-3d' || mode === 'text-to-3d') && (
            <SelectControl param="output_format" label="输出格式" icon={Download} />
          )}
        </div>
      </div>

      {/* 高级参数 */}
      {advancedMode && (
        <div className="space-y-4">
          <h4 className="text-white text-sm font-medium">高级参数</h4>

          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <label className="text-white text-sm flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>同步模式</span>
            </label>
            <button
              onClick={() => handleSettingChange('sync_mode', !Boolean(settings.sync_mode))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                Boolean(settings.sync_mode) ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  Boolean(settings.sync_mode) ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
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