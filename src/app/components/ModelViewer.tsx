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
      }, undefined, (err) => {
        if (url === '/test.glb') {
          loadSrc('/test-models/test.glb')
        }
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

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const importGlb = () => {
    fileInputRef.current?.click()
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCurrentSrc(url)
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`} style={style}>
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <button onClick={importGlb} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">导入GLB</button>
      </div>
      <input ref={fileInputRef} type="file" accept=".glb" onChange={onFileChange} className="hidden" />
    </div>
  )
}
