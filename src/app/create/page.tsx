'use client'

import { ModelGenerator } from '@/components/ModelGenerator'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Wand2 } from 'lucide-react'

function CreateContent() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Model Generator</h1>
              <p className="text-gray-400">Create stunning 3D models with artificial intelligence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ModelGenerator />
      </div>
    </div>
  )
}

export default function Create() {
  return (
    <ProtectedRoute>
      <CreateContent />
    </ProtectedRoute>
  )
}