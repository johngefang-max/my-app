'use client'

import { Suspense } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  return (
    <Suspense fallback={fallback || <div className="flex items-center justify-center h-full text-white">Loading...</div>}>
      {children}
    </Suspense>
  )
}