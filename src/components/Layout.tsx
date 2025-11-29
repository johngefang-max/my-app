'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { UserProfile } from '@/components/UserProfile'
import { Button } from '@/components/ui/Button'
import { Home, GalleryVertical, PlusCircle, Settings, UserCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { MobileNav } from '@/components/MobileNav'
import { useAuth } from '@/app/contexts/AuthContext'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser, isAuthenticated } = useStore()
  const { openLogin } = useAuth()

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          return
        }

        if (session?.user) {
          // Fetch user profile from database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userData && !userError) {
            setUser(userData)
          }
        }
      } catch (error) {
        console.error('Session initialization error:', error)
      }
    }

    checkSession()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch user profile from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (userData && !userError) {
          setUser(userData)
        }
      } else {
        setUser(null)
        if (
          pathname &&
          !pathname.startsWith('/auth') &&
          pathname !== '/' &&
          !pathname.startsWith('/gallery')
        ) {
          router.push('/auth')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, router, pathname])

  // Don't show layout on auth pages
  if (pathname?.startsWith('/auth')) {
    return <>{children}</>
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Gallery', href: '/gallery', icon: GalleryVertical },
    { name: 'Create', href: '/create', icon: PlusCircle },
    { name: 'Profile', href: '/profile', icon: UserCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button 
                  onClick={() => router.push('/')}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <Logo className="h-8 w-8 text-purple-400" />
                  <span className="text-xl font-bold text-white">3D Platform</span>
                </button>
              </div>
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.name}
                      onClick={() => router.push(item.href)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 inline mr-2" />
                      {item.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center">
              {isAuthenticated ? (
                <UserProfile />
              ) : (
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={openLogin}
                    variant="secondary"
                    size="sm"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => router.push('/generator')}
                    variant="primary"
                    size="sm"
                  >
                    Free Trial
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="hidden md:block bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 3D Platform. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
