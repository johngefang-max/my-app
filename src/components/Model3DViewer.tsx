'use client'

import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, useGLTF, Center, Stats } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'

interface Model3DViewerProps {
  modelUrl: string
  className?: string
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const meshRef = useRef<THREE.Group>(null)
  const { viewerSettings } = useStore()

  useFrame((state) => {
    if (meshRef.current && viewerSettings.showGrid) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Center>
      <group ref={meshRef}>
        <primitive 
          object={scene} 
          scale={1}
        />
      </group>
    </Center>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-400 mx-auto mb-2 sm:mb-4"></div>
        <p className="text-gray-400 text-sm sm:text-base">Loading 3D model...</p>
      </div>
    </div>
  )
}

export function Model3DViewer({ modelUrl, className = '' }: Model3DViewerProps) {
  const { viewerSettings } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={`relative w-full h-full bg-gray-900 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <Model url={modelUrl} />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* Environment */}
          <Environment preset={viewerSettings.lightingPreset as any} />
          
          {/* Grid */}
          {viewerSettings.showGrid && (
            <Grid
              args={[20, 20]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6b7280"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#374151"
              fadeDistance={30}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={true}
            />
          )}
          
          {/* Axes Helper */}
          {viewerSettings.showAxes && <axesHelper args={[5]} />}
          
          {/* Controls - Enhanced for mobile */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={50}
            autoRotate={false}
            autoRotateSpeed={0.5}
            enableDamping={true}
            dampingFactor={0.05}
            touchAction="pan-y"
            makeDefault={true}
          />
          
          {/* Stats */}
          <Stats />
        </Suspense>
      </Canvas>
      
      {isLoading && <LoadingFallback />}
    </div>
  )
}
