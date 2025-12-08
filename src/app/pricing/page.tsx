'use client'

import { Check, Star, Zap, Shield, Users, Clock, Download, Headphones, CheckCircle, Globe } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

export default function Pricing() {
  const { language, setLanguage, t } = useLanguage()
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('pricing.title')}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t('pricing.title.highlight')}
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className="text-gray-300">{t('pricing.monthly')}</span>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6"></span>
            </button>
            <span className="text-white">{t('pricing.yearly')}</span>
            <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-semibold">{t('pricing.save')}</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition-all">
              <div className="text-center mb-8">
                <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('pricing.free.title')}</h3>
                <div className="text-4xl font-bold text-white mb-2">{t('pricing.free.price')}</div>
                <div className="text-gray-400">{t('pricing.free.period')}</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.free.feature1')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.free.feature2')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.free.feature3')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.free.feature4')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.free.feature5')}</span>
                </li>
              </ul>
              
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors">
                {t('pricing.free.current')}
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {language === 'zh' ? '最受欢迎' : 'Most Popular'}
                </div>
              </div>
              
              <div className="text-center mb-8">
                <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('pricing.pro.title')}</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  {t('pricing.pro.price')}
                  <span className="text-lg text-gray-400">{t('pricing.pro.period')}</span>
                </div>
                <div className="text-gray-400">{t('pricing.pro.yearly')}</div>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.pro.feature1')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.pro.feature2')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.pro.feature3')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.pro.feature4')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.pro.feature5')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.pro.feature6')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.pro.feature7')}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">{t('pricing.pro.feature8')}</span>
                </li>
              </ul>
              
              <a href="/generator" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors font-semibold text-center">
                {t('pricing.pro.choose')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('pricing.compare.title')}</h2>
            <p className="text-xl text-gray-300">{t('pricing.compare.subtitle')}</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-6 text-white font-semibold">{language === 'zh' ? '功能特性' : 'Features'}</th>
                    <th className="text-center p-6 text-white font-semibold">{t('pricing.free.title')}</th>
                    <th className="text-center p-6 text-purple-400 font-semibold">{t('pricing.pro.title')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="p-6 text-gray-300">{language === 'zh' ? '每月生成次数' : 'Monthly Generations'}</td>
                    <td className="text-center p-6 text-gray-300">10</td>
                    <td className="text-center p-6 text-white">100</td>
                  </tr>
                  <tr className="border-b border-gray-700 bg-gray-800/30">
                    <td className="p-6 text-gray-300">{language === 'zh' ? '模型质量' : 'Model Quality'}</td>
                    <td className="text-center p-6 text-gray-300">{language === 'zh' ? '基础' : 'Basic'}</td>
                    <td className="text-center p-6 text-white">{language === 'zh' ? '高质量' : 'High Quality'}</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-6 text-gray-300">{language === 'zh' ? '渲染速度' : 'Render Speed'}</td>
                    <td className="text-center p-6 text-gray-300">{language === 'zh' ? '标准' : 'Standard'}</td>
                    <td className="text-center p-6 text-white">{language === 'zh' ? '快速' : 'Fast'}</td>
                  </tr>
                  <tr className="border-b border-gray-700 bg-gray-800/30">
                    <td className="p-6 text-gray-300">{language === 'zh' ? '导出格式' : 'Export Formats'}</td>
                    <td className="text-center p-6 text-gray-300">{language === 'zh' ? '基础' : 'Basic'}</td>
                    <td className="text-center p-6 text-green-400">
                      <CheckCircle className="h-5 w-5 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="p-6 text-gray-300">{language === 'zh' ? '商业使用许可' : 'Commercial License'}</td>
                    <td className="text-center p-6 text-red-400">-</td>
                    <td className="text-center p-6 text-green-400">
                      <CheckCircle className="h-5 w-5 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-gray-700 bg-gray-800/30">
                    <td className="p-6 text-gray-300">{language === 'zh' ? '批量处理' : 'Batch Processing'}</td>
                    <td className="text-center p-6 text-red-400">-</td>
                    <td className="text-center p-6 text-green-400">
                      <CheckCircle className="h-5 w-5 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-800/30">
                    <td className="p-6 text-gray-300">{language === 'zh' ? '客服支持' : 'Customer Support'}</td>
                    <td className="text-center p-6 text-gray-300">{language === 'zh' ? '社区' : 'Community'}</td>
                    <td className="text-center p-6 text-white">{language === 'zh' ? '优先支持' : 'Priority'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('pricing.faq.title')}</h2>
            <p className="text-xl text-gray-300">{t('pricing.faq.subtitle')}</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">{t('pricing.faq.q1')}</h3>
              <p className="text-gray-300">{t('pricing.faq.a1')}</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">{t('pricing.faq.q2')}</h3>
              <p className="text-gray-300">{t('pricing.faq.a2')}</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">{t('pricing.faq.q3')}</h3>
              <p className="text-gray-300">{t('pricing.faq.a3')}</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">{t('pricing.faq.q4')}</h3>
              <p className="text-gray-300">{t('pricing.faq.a4')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">{t('pricing.cta.title')}</h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('pricing.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/generator" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all text-center">
              {t('pricing.cta.freeTrial')}
            </a>
          </div>
          
        </div>
      </section>

      
    </div>
  )
}
