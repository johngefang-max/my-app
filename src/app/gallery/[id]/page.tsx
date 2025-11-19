'use client'

import { useState, use as usePromise } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../contexts/LanguageContext'
import { ArrowLeft, Download, Share2, Heart, Eye, Box } from 'lucide-react'

export default function GalleryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [comments, setComments] = useState<Array<{ name: string, content: string, date: string }>>([
    { name: 'Maya', content: language === 'zh' ? '细节很不错，拓扑很干净。' : 'Great detail and clean topology.', date: '2024-11-18' },
    { name: 'Alex', content: language === 'zh' ? '导出直接能用，赞。' : 'Exports work out of the box.', date: '2024-11-19' },
  ])
  const [input, setInput] = useState('')

  const addComment = () => {
    const content = input.trim()
    if (!content) return
    setComments([{ name: 'You', content, date: new Date().toISOString().slice(0, 10) }, ...comments])
    setInput('')
  }

  const { id } = usePromise(params)
  const title = id.replace(/-/g, ' ')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="fixed top-0 w-full bg-black/20 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => router.back()} className="flex items-center space-x-2 text-white">
              <ArrowLeft className="h-5 w-5" />
              <span>{t('common.back')}</span>
            </button>
            <div className="flex items-center space-x-2">
              <Box className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold text-white">AI3D Pro</span>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-6 capitalize">{title}</h1>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <div className="bg-gray-800/50 rounded-2xl h-96 flex items-center justify-center border border-gray-700">
                <Box className="h-24 w-24 text-purple-400" />
              </div>
              <div className="flex items-center space-x-4 mt-4 text-gray-300">
                <div className="flex items-center space-x-1">
                  <Heart className="h-5 w-5 text-red-400" />
                  <span>2.3k</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-5 w-5 text-blue-400" />
                  <span>15.6k</span>
                </div>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">{t('gallery.model.polygons')}</div>
                  <div className="text-white font-semibold">42,130</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">{t('gallery.model.texture')}</div>
                  <div className="text-white font-semibold">4K</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">{t('gallery.model.format')}</div>
                  <div className="text-white font-semibold">FBX, GLTF</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">{t('gallery.model.generationTime')}</div>
                  <div className="text-white font-semibold">31s</div>
                </div>
              </div>
              <div className="flex space-x-4">
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>{t('gallery.model.download')}</span>
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">{t('comments.title')}</h2>
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 mb-6">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('comments.addPlaceholder')}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg text-white p-4 mb-4 focus:outline-none focus:border-purple-500"
              rows={3}
            />
            <div className="flex justify-end">
              <button onClick={addComment} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
                {t('comments.submit')}
              </button>
            </div>
          </div>
          {comments.length === 0 ? (
            <div className="text-gray-400">{t('comments.empty')}</div>
          ) : (
            <ul className="space-y-4">
              {comments.map((c, i) => (
                <li key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-semibold">{c.name}</div>
                    <div className="text-gray-500 text-sm">{c.date}</div>
                  </div>
                  <div className="text-gray-300">{c.content}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}