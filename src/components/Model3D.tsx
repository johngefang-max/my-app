'use client'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: any
    }
  }
}

import { useGLTF } from '@react-three/drei'
import { forwardRef, useMemo } from 'react'

const PrimitiveTag: any = 'primitive'

// 预加载模型缓存
const modelCache = new Map<string, any>()

interface ModelProps {
  url: string
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export const Model = forwardRef<any, ModelProps>(({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}, ref) => {
  // 使用useMemo来缓存模型加载结果
  const { scene } = useMemo(() => {
    try {
      // 如果已经缓存了模型，直接返回
      if (modelCache.has(url)) {
        return { scene: modelCache.get(url) }
      }

      // 否则加载并缓存模型
      const gltf = useGLTF(url)
      if (gltf.scene) {
        modelCache.set(url, gltf.scene.clone())
      }
      return gltf
    } catch (error) {
      console.error('Model loading error:', error)
      return { scene: null }
    }
  }, [url])

  if (!scene) {
    return null
  }

  return (
    <PrimitiveTag
      ref={ref}
      object={scene.clone()}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  )
})

Model.displayName = 'Model'

// 预加载函数
export function preloadModel(url: string) {
  if (!modelCache.has(url)) {
    const loader = new (window as any).THREE.GLTFLoader()
    loader.load(url, (gltf: any) => {
      modelCache.set(url, gltf.scene)
    })
  }
}
