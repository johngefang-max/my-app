'use client'
import { useLanguage } from '../contexts/LanguageContext'

export default function CareersPage() {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen bg-gray-900 pt-20">
      <section className="px-4 sm:px-6 lg:px-8 py-10 border-b border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-3">{t('home.footer.careers')}</h1>
          <p className="text-gray-400">Join us to build the future of 3D creation.</p>
        </div>
      </section>
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto text-gray-300">
          <p>Open roles: frontend, backend, 3D research.</p>
        </div>
      </section>
    </main>
  )
}
