'use client'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any
      directionalLight: any
    }
  }
}

import { useEffect, useState } from 'react'

interface ThreeViewerProps {
  modelUrl: string
  autoRotate?: boolean
  environment?: string
  showGrid?: boolean
  shadows?: boolean
}

export function ThreeViewer({
  modelUrl,
  autoRotate = true,
  environment = 'city',
  showGrid = true,
  shadows = true
}: ThreeViewerProps) {
  const [isClient, setIsClient] = useState(false)
  const [Component, setComponent] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)

    // 动态导入React Three Fiber组件
    const loadThreeJS = async () => {
      try {
        const [
          { Canvas },
          dreiModule,
          modelModule
        ] = await Promise.all([
          import('@react-three/fiber'),
          import('@react-three/drei'),
          import('./Model3D')
        ])

        const { OrbitControls, Environment, Center, PerspectiveCamera, Grid, ContactShadows } = dreiModule
        const { Model } = modelModule

        // 创建一个包含所有Three.js逻辑的内联组件
        const ThreeComponent = () => (
          <Canvas
            shadows
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ preserveDrawingBuffer: true }}
          >
            {/* 相机控制 */}
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              minDistance={1}
              maxDistance={20}
            />

            {/* 灯光设置 */}
            {(() => { const AmbientLightTag: any = 'ambientLight'; return <AmbientLightTag intensity={0.5} /> })()}
            {(() => { const DirectionalLightTag: any = 'directionalLight'; return (
              <DirectionalLightTag
                position={[10, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
            ) })()}

            {/* 环境贴图 */}
            <Environment preset={environment as any} />

            {/* 网格 */}
            {showGrid && (
              <Grid
                position={[0, -1, 0]}
                args={[20, 20]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#6b7280"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#9333ea"
                fadeDistance={30}
                fadeStrength={1}
                followCamera={false}
                infiniteGrid
              />
            )}

            {/* 地面阴影 */}
            {shadows && (
              <ContactShadows
                position={[0, -0.99, 0]}
                opacity={0.75}
                scale={10}
                blur={2.5}
                far={4}
              />
            )}

            {/* 模型加载 */}
            <Center>
              <Model url={modelUrl} />
            </Center>
          </Canvas>
        )

        setComponent(() => ThreeComponent)
      } catch (error) {
        console.error('Failed to load Three.js components:', error)
      }
    }

    loadThreeJS()
  }, [modelUrl, autoRotate, environment, showGrid, shadows])

  if (!isClient || !Component) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>加载3D引擎中...</p>
        </div>
      </div>
    )
  }

  return <Component />
}
