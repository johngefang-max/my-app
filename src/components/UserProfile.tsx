'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { LogOut, Settings, User, CreditCard, Coins } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function UserProfile() {
  const { user, setUser } = useStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/auth')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown)
  }

  if (!user) return null

  const subscriptionTiers = {
    free: { label: 'Free', color: 'text-gray-400' },
    pro: { label: 'Pro', color: 'text-purple-400' },
    enterprise: { label: 'Enterprise', color: 'text-purple-400' }
  }

  const currentTier = subscriptionTiers[user.plan as keyof typeof subscriptionTiers] || subscriptionTiers.free

  return (
    <div className="relative">
      <button
        onClick={handleProfileClick}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <div className="relative">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -right-2 -top-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <Coins className="w-3 h-3" />
            {user.points ?? 0}
          </div>
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">
            {user.username ?? user.email}
          </div>
          <div className={`text-xs ${currentTier.color}`}>
            {currentTier.label} Plan
          </div>
        </div>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-20">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items中心 justify中心">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {user.username ?? user.email}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                <Coins className="w-4 h-4" />
                <span>积分：{user.points ?? 0}</span>
              </div>
            </div>
            
            <div className="py-2">
              <button
                onClick={() => {
                  router.push('/profile')
                  setShowDropdown(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Profile Settings</span>
              </button>
              
              <button
                onClick={() => {
                  router.push('/billing')
                  setShowDropdown(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Billing & Subscription</span>
              </button>
              
              <hr className="border-gray-700 my-2" />
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
