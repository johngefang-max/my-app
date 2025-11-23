'use client'

import { Download, Share2, Heart, Eye, RotateCcw, ZoomIn, ZoomOut, Grid3x3, Settings, Globe } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import Header from '../components/Header'

export default function Gallery() {
  const { language, setLanguage, t } = useLanguage()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <Header
        logoText="3D Gallery"
        logoIcon={
          <div className="bg-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
            <Grid3x3 className="h-5 w-5 text-white" />
          </div>
        }
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('gallery.title')}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('gallery.title.highlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('gallery.subtitle')}
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                placeholder={t('gallery.search.placeholder')} 
                className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <select className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500">
                <option>{t('gallery.category.all')}</option>
                <option>{t('gallery.category.architecture')}</option>
                <option>{t('gallery.category.character')}</option>
                <option>{t('gallery.category.furniture')}</option>
                <option>{t('gallery.category.vehicle')}</option>
                <option>{t('gallery.category.animal')}</option>
              </select>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
                {t('common.search')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Model */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('gallery.featured.title')}</h2>
            <p className="text-xl text-gray-300">{t('gallery.featured.subtitle')}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl p-8 border border-purple-500/20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* 3D Model Viewer */}
              <div className="relative">
                <div className="bg-gray-800/50 rounded-2xl h-96 flex items-center justify-center border border-gray-700">
                  <div className="text-center">
                    <div className="bg-purple-600 w-32 h-32 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <div className="bg-white w-16 h-16 rounded-lg"></div>
                    </div>
                    <p className="text-gray-300">{t('gallery.preview.title')}</p>
                    <p className="text-sm text-gray-500">{t('gallery.preview.controls')}</p>
                  </div>
                </div>
                
                {/* 3D Controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 backdrop-blur-md rounded-lg p-3 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-colors">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors">
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors">
                        <ZoomOut className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors">
                        {t('common.on')}
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        {t('common.preview')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Model Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">{t('common.loading')}</h3>
                  <p className="text-gray-300 mb-4">{t('gallery.model.by')} {t('common.loading')}</p>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-5 w-5 text-red-400" />
                      <span className="text-white">2.3k</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-5 w-5 text-blue-400" />
                      <span className="text-white">15.6k</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="h-5 w-5 text-green-400" />
                      <span className="text-white">892</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">{t('gallery.model.polygons')}</div>
                    <div className="text-white font-semibold">45,230</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">{t('gallery.model.texture')}</div>
                    <div className="text-white font-semibold">4K</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">{t('gallery.model.format')}</div>
                    <div className="text-white font-semibold">FBX, OBJ</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm">{t('gallery.model.generationTime')}</div>
                    <div className="text-white font-semibold">28s</div>
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
        </div>
      </section>

      {/* Model Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white">{t('gallery.latest.title')}</h2>
            <div className="flex space-x-2">
              <a href="/generator" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">{t('gallery.createModel')}</a>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">{t('gallery.latest')}</button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">{t('gallery.popular')}</button>
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">{t('gallery.favorites')}</button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Model Card 1 */}
            <a href="/gallery/model-1" className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group block">
              <div className="aspect-square bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                <div className="bg-blue-600 w-16 h-16 rounded-lg"></div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{t('common.loading')}</h3>
                <p className="text-gray-400 text-sm mb-3">{t('gallery.model.by')} {t('common.loading')}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">456</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">2.1k</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-all">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </a>
            
            {/* Model Card 2 */}
            <a href="/gallery/model-2" className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group block">
              <div className="aspect-square bg-gradient-to-br from-green-900/50 to-teal-900/50 flex items-center justify-center">
                <div className="bg-green-600 w-16 h-16 rounded-full"></div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{t('common.loading')}</h3>
                <p className="text-gray-400 text-sm mb-3">{t('gallery.model.by')} {t('common.loading')}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">789</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">3.5k</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-all">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </a>
            
            {/* Model Card 3 */}
            <a href="/gallery/model-3" className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group block">
              <div className="aspect-square bg-gradient-to-br from-red-900/50 to-orange-900/50 flex items-center justify-center">
                <div className="bg-red-600 w-16 h-16 rounded-lg transform rotate-45"></div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{t('common.loading')}</h3>
                <p className="text-gray-400 text-sm mb-3">{t('gallery.model.by')} {t('common.loading')}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">1.2k</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">5.8k</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-all">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </a>
            
            {/* Model Card 4 */}
            <a href="/gallery/robot" className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group block">
              <div className="aspect-square bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                <div className="bg-purple-600 w-16 h-20 rounded-full"></div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">机器人角色</h3>
                <p className="text-gray-400 text-sm mb-3">by @scifi_creator</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">2.1k</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">9.2k</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-all">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </a>
            
            {/* Model Card 5 */}
            <a href="/gallery/guitar" className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group block">
              <div className="aspect-square bg-gradient-to-br from-yellow-900/50 to-amber-900/50 flex items-center justify-center">
                <div className="bg-yellow-600 w-20 h-12 rounded-lg"></div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">古典吉他</h3>
                <p className="text-gray-400 text-sm mb-3">by @musicmaker</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">567</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">2.8k</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-all">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </a>
            
            {/* Model Card 6 */}
            <a href="/gallery/spaceship" className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group block">
              <div className="aspect-square bg-gradient-to-br from-indigo-900/50 to-blue-900/50 flex items-center justify-center">
                <div className="bg-indigo-600 w-16 h-16 rounded-full"></div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">宇宙飞船</h3>
                <p className="text-gray-400 text-sm mb-3">by @spaceexplorer</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">1.8k</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">7.3k</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-all">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </a>
            
            {/* Model Card 7 */}
            <a href="/gallery/rose-garden" className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group block">
              <div className="aspect-square bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center">
                <div className="bg-emerald-600 w-16 h-16 rounded-lg transform rotate-12"></div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">翡翠雕像</h3>
                <p className="text-gray-400 text-sm mb-3">by @ancientart</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">923</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">4.1k</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-all">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </a>
            
            {/* Model Card 8 */}
            <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all group">
              <div className="aspect-square bg-gradient-to-br from-rose-900/50 to-pink-900/50 flex items-center justify-center">
                <div className="bg-rose-600 w-18 h-18 rounded-full"></div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-2">玫瑰花园</h3>
                <p className="text-gray-400 text-sm mb-3">by @flowerpower</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">1.5k</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">6.7k</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-all">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Load More */}
          <div className="text-center mt-12">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors">
              {t('gallery.grid.loadMore')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Grid3x3 className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">3D Gallery</span>
              </div>
              <p className="text-gray-400">{t('gallery.footer.description')}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('gallery.footer.browse')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('gallery.footer.latest')}</a></li>
                <li><a href="#" className="hover:text-white">{t('gallery.footer.popular')}</a></li>
                <li><a href="#" className="hover:text-white">{t('gallery.footer.editorPicks')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('gallery.footer.community')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('gallery.footer.creators')}</a></li>
                <li><a href="#" className="hover:text-white">{t('gallery.footer.challenges')}</a></li>
                <li><a href="#" className="hover:text-white">{t('gallery.footer.tutorials')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('gallery.footer.support')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('gallery.footer.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white">{t('gallery.footer.apiDocs')}</a></li>
                <li><a href="#" className="hover:text-white">{t('gallery.footer.contact')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 3D Gallery. {t('gallery.footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}