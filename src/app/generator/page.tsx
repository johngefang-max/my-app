'use client'

import { useState } from 'react'
import { Upload, Type, Image as ImageIcon, Send, Download, Settings, Sparkles, RotateCcw, Play, Pause, Globe } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Generator() {
  const { language, setLanguage, t } = useLanguage()
  const [activeTab, setActiveTab] = useState('text')
  const [textInput, setTextInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedModel, setGeneratedModel] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setGeneratedModel(true)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-black/20 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">AI 3D Generator</span>
            </a>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language === 'zh' ? 'EN' : '中文'}</span>
              </button>
              <a href="/gallery" className="text-gray-300 hover:text-white transition-colors">
                {t('gallery.title')}
              </a>
              <button className="text-gray-300 hover:text-white transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                {t('nav.myWorks')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('generator.title')}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('generator.title.highlight')}
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('generator.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Section */}
            <div className="space-y-8">
              {/* Input Type Selector */}
              <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">{t('generator.input.title')}</h2>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      activeTab === 'text'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <Type className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-semibold">{t('generator.input.text')}</div>
                    <div className="text-sm opacity-75">{t('generator.input.text.desc')}</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('image')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      activeTab === 'image'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <div className="font-semibold">{t('generator.input.image')}</div>
                    <div className="text-sm opacity-75">{t('generator.input.image.desc')}</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('sketch')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      activeTab === 'sketch'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="h-8 w-8 mx-auto mb-2 bg-current rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="font-semibold">{t('generator.input.sketch')}</div>
                    <div className="text-sm opacity-75">{t('generator.input.sketch.desc')}</div>
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">{t('generator.input.text')}</h3>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t('generator.text.placeholder')}
                      className="w-full h-32 bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{textInput.length}/500 {t('generator.text.characters')}</span>
                      <div className="flex space-x-2">
                        <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                          {t('generator.text.random')}
                        </button>
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                          {t('generator.text.optimize')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'image' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">{t('generator.input.image')}</h3>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-white mb-2">{t('generator.image.upload')}</p>
                      <p className="text-gray-400 text-sm">{t('generator.image.support')}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-800/50 rounded-lg h-20 flex items-center justify-center text-gray-400 text-xs">
                        {t('common.loading')}
                      </div>
                      <div className="bg-gray-800/50 rounded-lg h-20 flex items-center justify-center text-gray-400 text-xs">
                        {t('common.loading')}
                      </div>
                      <div className="bg-gray-800/50 rounded-lg h-20 flex items-center justify-center text-gray-400 text-xs">
                        {t('common.loading')}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'sketch' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">{t('generator.input.sketch')}</h3>
                    <div className="bg-gray-800/50 rounded-lg h-64 flex items-center justify-center border border-gray-600">
                      <div className="text-center">
                        <div className="bg-purple-600 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-white rounded-full"></div>
                        </div>
                        <p className="text-white mb-2">{t('generator.sketch.draw')}</p>
                        <p className="text-gray-400 text-sm">{t('generator.sketch.support')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors text-sm">
                        {t('common.clear')}
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors text-sm">
                        {t('common.back')}
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors text-sm">
                        {t('common.edit')}
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition-colors text-sm">
                        {t('common.settings')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Generation Settings */}
              <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">{t('generator.settings.title')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">{t('generator.settings.style')}</label>
                    <select className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500">
                      <option>{t('generator.settings.style.realistic')}</option>
                      <option>{t('generator.settings.style.cartoon')}</option>
                      <option>{t('generator.settings.style.lowpoly')}</option>
                      <option>{t('generator.settings.style.cyberpunk')}</option>
                      <option>{t('generator.settings.style.retro')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">{t('generator.settings.quality')}</label>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg text-sm">{t('generator.settings.quality.low')}</button>
                      <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm">{t('generator.settings.quality.medium')}</button>
                      <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm">{t('generator.settings.quality.high')}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">{t('generator.settings.format')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm">OBJ</button>
                      <button className="bg-purple-600 text-white py-2 px-3 rounded-lg text-sm">FBX</button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm">GLTF</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!textInput && activeTab === 'text')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('generator.generating')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>{t('generator.generate')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">{t('generator.preview.title')}</h3>
                  <div className="flex space-x-2">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
                      <div className="text-xs font-bold">360°</div>
                    </button>
                  </div>
                </div>
                
                {generatedModel ? (
                  <div className="relative">
                    <div className="bg-gray-800/50 rounded-xl h-96 flex items-center justify-center border border-gray-700">
                      <div className="text-center">
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-32 h-32 rounded-2xl mx-auto mb-4 flex items-center justify-center transform rotate-12">
                          <div className="bg-white w-16 h-16 rounded-lg"></div>
                        </div>
                        <p className="text-white font-semibold">{t('generator.preview.generated')}</p>
                        <p className="text-gray-400 text-sm">{t('generator.preview.drag')}</p>
                      </div>
                    </div>
                    
                    {/* Animation Controls */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/50 backdrop-blur-md rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-colors">
                            <Play className="h-4 w-4" />
                          </button>
                          <button className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors">
                            <Pause className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex space-x-1">
                          <button className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors">
                            {t('common.on')}
                          </button>
                          <button className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors">
                            {t('common.preview')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 rounded-xl h-96 flex items-center justify-center border border-gray-700">
                    <div className="text-center">
                      <Sparkles className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">{t('generator.preview.waiting')}</p>
                      <p className="text-gray-400 text-sm">{t('generator.preview.inputPrompt')}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {generatedModel && (
                <div className="space-y-4">
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4">{t('generator.modelInfo.title')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">{t('generator.modelInfo.polygons')}</div>
                        <div className="text-white font-semibold">12,450</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">{t('generator.modelInfo.vertices')}</div>
                        <div className="text-white font-semibold">8,230</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">{t('generator.modelInfo.texture')}</div>
                        <div className="text-white font-semibold">2K</div>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">{t('generator.modelInfo.fileSize')}</div>
                        <div className="text-white font-semibold">2.3MB</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>{t('generator.actions.download')}</span>
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                        {t('generator.actions.edit')}
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                        {t('generator.actions.share')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">AI 3D Generator</span>
              </div>
              <p className="text-gray-400">{t('generator.footer.description')}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('generator.footer.generationMethods')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('generator.footer.textGeneration')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.imageTo3d')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.sketchGeneration')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('generator.footer.tools')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('generator.footer.modelEditor')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.materialLibrary')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.exportSettings')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('generator.footer.help')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('generator.footer.userGuide')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.apiDocs')}</a></li>
                <li><a href="#" className="hover:text-white">{t('generator.footer.techSupport')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI 3D Generator. {t('generator.footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}