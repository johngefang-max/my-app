'use client'

import { useEffect, useRef } from 'react'

type Props = {
  className?: string
  dotSize?: number
  gap?: number
  baseColor?: string
  activeColor?: string
  proximity?: number
  shockRadius?: number
  shockStrength?: number
}

export default function DotGridBackground({
  className,
  dotSize = 3,
  gap = 30,
  baseColor = 'rgba(82,39,255,0.25)',
  activeColor = 'rgba(236,72,153,0.8)',
  proximity = 150,
  shockRadius = 250,
  shockStrength = 6,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef<{ x: number; y: number; dx: number; dy: number; speed: number }>({ x: -9999, y: -9999, dx: 0, dy: 0, speed: 0 })
  const shockRef = useRef<{ x: number; y: number; t: number; active: boolean }>({ x: 0, y: 0, t: 0, active: false })
  const gridRef = useRef<{ points: Array<{ x: number; y: number }> }>({ points: [] })
  const rafRef = useRef<number | null>(null)
  const dimsRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 1 })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const dpr = Math.max(1, window.devicePixelRatio || 1)

    const measure = () => {
      const rect = (canvas.parentElement ?? canvas).getBoundingClientRect()
      dimsRef.current = { w: rect.width, h: rect.height, dpr }
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const points: Array<{ x: number; y: number }> = []
      for (let y = gap / 2; y < rect.height; y += gap) {
        for (let x = gap / 2; x < rect.width; x += gap) {
          points.push({ x, y })
        }
      }
      gridRef.current.points = points
    }

    measure()

    const onMove = (e: MouseEvent) => {
      const rect = (canvas.parentElement ?? canvas).getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        onLeave()
        return
      }
      mouseRef.current.dx = x - mouseRef.current.x
      mouseRef.current.dy = y - mouseRef.current.y
      mouseRef.current.speed = Math.hypot(mouseRef.current.dx, mouseRef.current.dy)
      mouseRef.current.x = x
      mouseRef.current.y = y
    }

    const onLeave = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
      mouseRef.current.speed = 0
    }

    const onClick = (e: MouseEvent) => {
      const rect = (canvas.parentElement ?? canvas).getBoundingClientRect()
      shockRef.current.x = e.clientX - rect.left
      shockRef.current.y = e.clientY - rect.top
      shockRef.current.t = performance.now()
      shockRef.current.active = true
    }

    const render = () => {
      ctx.clearRect(0, 0, dimsRef.current.w, dimsRef.current.h)
      const now = performance.now()

      let shockR = 0
      if (shockRef.current.active) {
        const dt = (now - shockRef.current.t) / 1000
        shockR = Math.min(shockRadius, dt * shockRadius)
        if (dt > 1.2) shockRef.current.active = false
      }

      for (const p of gridRef.current.points) {
        const dx = p.x - mouseRef.current.x
        const dy = p.y - mouseRef.current.y
        const dist = Math.hypot(dx, dy)
        const near = Math.max(0, 1 - dist / proximity)

        const sdx = p.x - shockRef.current.x
        const sdy = p.y - shockRef.current.y
        const sdist = Math.hypot(sdx, sdy)
        const shockEffect = shockRef.current.active && sdist < shockR ? (1 - sdist / shockR) : 0

        const size = dotSize + near * 3 + shockEffect * shockStrength
        const colorMix = Math.min(1, near * 2 + shockEffect)
        const r = (c: string) => c
        const color = colorMix > 0.05 ? activeColor : baseColor

        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(render)
    }

    const ro = new ResizeObserver(() => measure())
    ro.observe(canvas.parentElement ?? canvas)
    window.addEventListener('resize', measure)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick)
    rafRef.current = requestAnimationFrame(render)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [dotSize, gap, baseColor, activeColor, proximity, shockRadius, shockStrength])

  return <canvas ref={canvasRef} className={className ?? 'absolute inset-0 w-full h-full block'} style={{ pointerEvents: 'none' }} />
}