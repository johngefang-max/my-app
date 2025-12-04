'use client'

import { useState, useEffect } from 'react'

interface SimpleModelViewerProps {
  modelUrl: string
  className?: string
}

export function SimpleModelViewer({ modelUrl, className = '' }: SimpleModelViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modelElement, setModelElement] = useState<any>(null)

  useEffect(() => {
    if (!modelUrl) {
      setError('没有提供模型URL')
      setLoading(false)
      return
    }

    const loadModel = async () => {
      try {
        setLoading(true)
        setError(null)

        // 创建简单的3D查看器，使用原生Three.js
        const THREE = await import('three')
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader')

        // 创建场景、相机和渲染器
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x0f172a)

        const camera = new THREE.PerspectiveCamera(
          45,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        )
        camera.position.set(0, 0, 5)

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.shadowMap.enabled = true

        // 添加灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(10, 10, 5)
        directionalLight.castShadow = true
        scene.add(directionalLight)

        // 加载模型
        const loader = new GLTFLoader()
        loader.load(
          modelUrl,
          (gltf) => {
            const model = gltf.scene
            model.position.set(0, 0, 0)
            scene.add(model)

            // 添加简单的轨道控制
            const addControls = async () => {
              try {
                const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls')
                const controls = new OrbitControls(camera, renderer.domElement)
                controls.enableDamping = true
                controls.dampingFactor = 0.05

                // 动画循环
                const animate = () => {
                  requestAnimationFrame(animate)
                  controls.update()
                  renderer.render(scene, camera)
                }
                animate()

                setModelElement(renderer.domElement)
                setLoading(false)
              } catch (controlError) {
                console.error('Failed to load orbit controls:', controlError)
                // 简单的旋转动画作为备用
                const animate = () => {
                  requestAnimationFrame(animate)
                  model.rotation.y += 0.01
                  renderer.render(scene, camera)
                }
                animate()

                setModelElement(renderer.domElement)
                setLoading(false)
              }
            }

            addControls()
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%')
          },
          (error) => {
            console.error('Model loading error:', error)
            const message = (error && typeof error === 'object' && 'message' in error)
              ? String((error as any).message)
              : String(error)
            setError('模型加载失败: ' + message)
            setLoading(false)
          }
        )

      } catch (err) {
        console.error('Failed to initialize 3D viewer:', err)
        setError('3D引擎初始化失败')
        setLoading(false)
      }
    }

    loadModel()
  }, [modelUrl])

  if (!modelUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-800/30 ${className}`}>
        <div className="text-center text-white">
          <div className="text-4xl mb-2">🎨</div>
          <p>请选择3D模型文件</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-900/20 ${className}`}>
        <div className="text-center text-red-400">
          <div className="text-4xl mb-2">❌</div>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>加载3D模型中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {modelElement && (
        <div
          dangerouslySetInnerHTML={{
            __html: modelElement.outerHTML || ''
          }}
        />
      )}
      <div className="absolute bottom-4 right-4 text-white text-xs bg-black/50 px-3 py-2 rounded-lg">
        <div>🖱️ 左键拖拽: 旋转 | 滚轮: 缩放 | 右键拖拽: 平移</div>
      </div>
    </div>
  )
}
