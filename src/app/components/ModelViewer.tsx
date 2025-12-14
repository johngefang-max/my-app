'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

type Props = {
  src?: string
  className?: string
  style?: React.CSSProperties
}

export default function ModelViewer({ src = '/test.glb', className = '', style }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const objectRef = useRef<THREE.Object3D | null>(null)
  const rafRef = useRef<number | null>(null)
  const [currentSrc, setCurrentSrc] = useState<string>(src)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 1000)
    camera.position.set(2.5, 2, 3)
    cameraRef.current = camera

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
    scene.add(hemi)
    const dir = new THREE.DirectionalLight(0xffffff, 1)
    dir.position.set(5, 10, 7.5)
    scene.add(dir)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controlsRef.current = controls

    const loader = new GLTFLoader()

    const loadSrc = (url: string) => {
      setIsLoading(true)
      setError(null)
      loader.load(url, (gltf) => {
        if (objectRef.current) {
          scene.remove(objectRef.current)
        }
        const obj = gltf.scene || gltf.scenes?.[0]
        if (!obj) return
        obj.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        const box = new THREE.Box3().setFromObject(obj)
        const size = new THREE.Vector3()
        box.getSize(size)
        const center = new THREE.Vector3()
        box.getCenter(center)
        obj.position.sub(center)
        const maxDim = Math.max(size.x, size.y, size.z)
        if (maxDim > 0) {
          const scale = 1.0 / maxDim
          obj.scale.setScalar(scale * 1.6)
        }
        scene.add(obj)
        objectRef.current = obj
        setIsLoading(false)
      }, undefined, (err) => {
        console.error('模型加载失败:', err, 'URL:', url)
        // 如果是测试模型加载失败，尝试备用路径
        if (url === '/test.glb') {
          loadSrc('/test-models/test.glb')
        }
        // 对于AI生成的模型，显示错误信息但不隐藏错误
        if (url && url.startsWith('http')) {
          console.error('AI生成的模型加载失败，可能是URL无效或网络问题')
          setError('模型加载失败，请检查网络连接')
        }
        setIsLoading(false)
      })
    }

    loadSrc(currentSrc)

    const onResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return
      const w = container.clientWidth
      const h = container.clientHeight
      rendererRef.current.setSize(w, h)
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      controls.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
      scene.clear()
    }
  }, [currentSrc])

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>正在加载模型...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white text-center">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
