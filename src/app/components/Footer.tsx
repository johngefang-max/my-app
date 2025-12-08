'use client'

import Link from 'next/link'
import { Box } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Footer() {
  const { t, language } = useLanguage()
  const termsHref = language === 'zh' ? '/zh/terms' : '/en/terms'
  const privacyHref = language === 'zh' ? '/zh/privacy' : '/en/privacy'
  const pref = language === 'zh' ? '/zh' : '/en'
  return (
    <footer className="bg-black border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Box className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold text-white">imageto3d</span>
            </div>
            <p className="text-gray-400">{t('home.subtitle')}</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('nav.product')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href={`${pref}/generator`} className="hover:text-white">{language === 'zh' ? '文本生成' : 'Text Generation'}</Link></li>
              <li><Link href={`${pref}/generator`} className="hover:text-white">{language === 'zh' ? '图片转3D' : 'Image to 3D'}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('home.footer.company')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href={`${pref}/about`} className="hover:text-white">{t('home.footer.aboutUs')}</Link></li>
              <li><Link href={`${pref}/careers`} className="hover:text-white">{t('home.footer.careers')}</Link></li>
              <li><Link href={`${pref}/contact`} className="hover:text-white">{t('home.footer.contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">{t('home.footer.support')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href={`${pref}/help`} className="hover:text-white">{t('home.footer.helpCenter')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 imageto3d. {t('home.footer.rights')}</p>
          <div className="mt-3 flex items-center justify-center gap-4 text-sm">
            <Link href={termsHref} className="hover:text-white">{language === 'zh' ? '服务条款' : 'Terms'}</Link>
            <span className="text-gray-600">·</span>
            <Link href={privacyHref} className="hover:text-white">{language === 'zh' ? '隐私政策' : 'Privacy'}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
