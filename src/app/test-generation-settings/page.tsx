'use client'

import { useState } from 'react'
import { Settings, Sparkles } from 'lucide-react'
import EnhancedGenerationSettings from '@/components/EnhancedGenerationSettings'
import { FAL_APIS, type FalApiConfig } from '@/config/fal-api'

export default function TestPage() {
  const [activeMode, setActiveMode] = useState<'text-to-image' | 'image-edit' | 'image-to-3d' | 'text-to-3d'>('text-to-image')
  const [selectedModel, setSelectedModel] = useState('flux-pro')

  const getInitialSettings = (mode: typeof activeMode): FalApiConfig => {
    const defaultModel = Object.entries(FAL_APIS).find(
      ([_, config]) => config.type === mode
    )?.[0] || ''

    const modelConfig = FAL_APIS[defaultModel as keyof typeof FAL_APIS]
    return {
      model_id: defaultModel,
      ...modelConfig?.default_params
    }
  }

  const [currentSettings, setCurrentSettings] = useState<FalApiConfig>(
    getInitialSettings(activeMode)
  )

  const handleModeChange = (mode: typeof activeMode) => {
    setActiveMode(mode)
    const newSettings = getInitialSettings(mode)
    setCurrentSettings(newSettings)
    const availableModels = Object.entries(FAL_APIS).filter(
      ([_, config]) => config.type === mode
    )
    if (availableModels.length > 0) {
      setSelectedModel(availableModels[0][0])
    }
  }

  const handleSettingsChange = (settings: FalApiConfig) => {
    setCurrentSettings(settings)
    console.log(`Settings updated for ${activeMode}:`, settings)
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    console.log(`Model changed to: ${modelId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
            <Sparkles className="h-10 w-10 text-purple-400" />
            <span>FAL-AI API 参数测试页面</span>
          </h1>
          <p className="text-gray-300">测试不同FAL-AI模型的完整参数配置</p>
        </div>

        {/* 模式选择 */}
        <div className="bg-black/30 rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">选择生成模式</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleModeChange('text-to-image')}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeMode === 'text-to-image'
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-sm font-medium">文本转图像</div>
            </button>
            <button
              onClick={() => handleModeChange('image-edit')}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeMode === 'image-edit'
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-sm font-medium">图像编辑</div>
            </button>
            <button
              onClick={() => handleModeChange('text-to-3d')}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeMode === 'text-to-3d'
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-sm font-medium">文本转3D</div>
            </button>
            <button
              onClick={() => handleModeChange('image-to-3d')}
              className={`p-4 rounded-lg border-2 transition-all ${
                activeMode === 'image-to-3d'
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="text-sm font-medium">图像转3D</div>
            </button>
          </div>
        </div>

        {/* 可用模型信息 */}
        <div className="bg-black/30 rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">当前模式可用模型</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(FAL_APIS)
              .filter(([_, config]) => config.type === activeMode)
              .map(([modelId, config]) => (
                <div
                  key={modelId}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedModel === modelId
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className="font-medium text-white mb-1">{config.name}</div>
                  <div className="text-sm text-gray-400 mb-2">ID: {modelId}</div>
                  <div className="text-xs text-gray-500">{config.type}</div>
                </div>
              ))}
          </div>
        </div>

        {/* 参数设置 */}
        <EnhancedGenerationSettings
          mode={activeMode}
          settings={currentSettings}
          onSettingsChange={handleSettingsChange}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />

        {/* 当前设置显示 */}
        <div className="bg-black/30 rounded-2xl p-6 border border-white/10 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>完整API参数 ({activeMode} - {selectedModel})</span>
            </h3>
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(currentSettings, null, 2))}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              复制配置
            </button>
          </div>
          <pre className="bg-gray-900/50 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto max-h-96">
            {JSON.stringify(currentSettings, null, 2)}
          </pre>
        </div>

        {/* 模拟API请求 */}
        <div className="bg-black/30 rounded-2xl p-6 border border-white/10 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">模拟API请求</h3>
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-sm font-medium text-white mb-2">请求URL:</div>
              <code className="text-green-400 text-xs">POST /api/fal/generate</code>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-sm font-medium text-white mb-2">请求体:</div>
              <pre className="text-gray-300 text-xs overflow-x-auto">
{JSON.stringify({
  type: activeMode.includes('3d') ? '3d' : 'image',
  data: currentSettings
}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}