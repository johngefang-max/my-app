'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  GalleryHorizontalEnd, 
  Square, 
  Sparkles,
  User,
  Settings,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Gallery', href: '/gallery', icon: GalleryHorizontalEnd },
  { name: 'Generator', href: '/generator', icon: Sparkles },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Profile', href: '/profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-cyan-400 mb-4">3D Model Preview</h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "bg-cyan-600 text-white" 
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}