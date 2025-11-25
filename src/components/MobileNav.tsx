'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from './ui/Button'
import { Menu, X, Home, GalleryVertical, PlusCircle, Settings, UserCircle } from 'lucide-react'
import { Logo } from './Logo'
import { UserProfile } from './UserProfile'
import { useStore } from '@/store/useStore'
import { useAuth } from '@/app/contexts/AuthContext'

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className = '' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useStore()
  const { openLogin } = useAuth()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Gallery', href: '/gallery', icon: GalleryVertical },
    { name: 'Create', href: '/create', icon: PlusCircle },
    { name: 'Profile', href: '/profile', icon: UserCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className={`md:hidden ${className}`}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Logo className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold text-white">3D Platform</span>
          </button>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <UserProfile />
            ) : (
              <Button
                onClick={openLogin}
                variant="secondary"
                size="sm"
              >
                Sign In
              </Button>
            )}
            
            <Button
              onClick={toggleMenu}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              {isOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 border-b border-gray-700">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
