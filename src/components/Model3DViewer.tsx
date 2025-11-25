'use client'

import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { ThreeElements } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, useGLTF, Center, Stats } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/store/useStore'

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface Model3DViewerProps {
  modelUrl: string
  className?: string
}

function Model({ url }: { url: string }) {
  return null
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
  return (
    <div className={`relative w-full h-full bg-gray-900 ${className}`}></div>
  )
}
