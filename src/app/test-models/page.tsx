'use client'

import { useRef, useEffect } from 'react'

export default function TestModelPage() {
  const testModels = [
    {
      name: '宇航员模型',
      url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
      description: '一个标准的3D宇航员模型'
    },
    {
      name: '头盔模型',
      url: 'https://modelviewer.dev/shared-assets/models/Helmet.glb',
      description: '一个防护头盔模型'
    },
    {
      name: '机器人模型',
      url: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb',
      description: '一个表情机器人模型'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">3D模型测试页面</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {testModels.map((model) => (
            <TestModelViewer key={model.url} model={model} />
          ))}
        </div>
      </div>

      <script
        type="module"
        src="https://unpkg.com/@google/model-viewer@latest/dist/model-viewer.min.js"
      />
    </div>
  )
}

function TestModelViewer({ model }: { model: { name: string; url: string; description: string } }) {
  const viewerRef = useRef<any>(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const handleError = (e: any) => {
      console.error(`Failed to load ${model.name}:`, e)
    }

    const handleLoad = () => {
      console.log(`${model.name} loaded successfully`)
    }

    viewer.addEventListener('error', handleError)
    viewer.addEventListener('load', handleLoad)

    return () => {
      viewer.removeEventListener('error', handleError)
      viewer.removeEventListener('load', handleLoad)
    }
  }, [model.name])

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h2 className="text-xl font-semibold text-white mb-2">{model.name}</h2>
      <p className="text-gray-400 mb-4">{model.description}</p>

      <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
        <model-viewer
          ref={viewerRef}
          src={model.url}
          auto-rotate
          camera-controls
          shadow-intensity="1"
          style={{
            width: '100%',
            height: '100%',
            background: '#1f2937'
          }}
        />
      </div>

      <div className="mt-4 flex space-x-2">
        <a
          href={model.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm underline"
        >
          在新窗口打开模型
        </a>
      </div>
    </div>
  )
}