'use client'

import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { supabase, User } from '@/lib/supabase'
import { PointsService } from '@/lib/points-service'

interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
  points: number
  total_points_earned: number
  total_points_spent: number
  plan: 'free' | 'premium' | 'enterprise'
}

type AuthContextType = {
  isAuthenticated: boolean
  authLoading: boolean
  isLoginOpen: boolean
  user: AuthUser | null
  userLoading: boolean
  refreshUserData: () => Promise<void>
  login: (username: string, password: string) => boolean
  logout: () => void
  openLogin: () => void
  closeLogin: () => void
  requireAuth: (onAuthed: () => void) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [userLoading, setUserLoading] = useState(false)

  const sessionHook = useSession()
  const isAuthenticated = !!sessionHook?.data
  const authLoading = sessionHook?.status === 'loading'

  // Fetch user data from Supabase when authenticated
  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated || !sessionHook?.data?.user?.email) {
      setUser(null)
      return
    }

    setUserLoading(true)
    try {
      // Get user from Supabase by email
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', sessionHook.data.user.email)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)

        // If user doesn't exist in Supabase, create them
        if (error.code === 'PGRST116') {
          await createSupabaseUser(sessionHook.data.user)
          // Retry fetching user data
          return fetchUserData()
        }

        setUser(null)
        return
      }

      if (userData) {
        const authUser: AuthUser = {
          id: userData.id,
          email: userData.email,
          name: userData.username,
          avatar_url: userData.avatar_url,
          points: userData.points,
          total_points_earned: userData.total_points_earned,
          total_points_spent: userData.total_points_spent,
          plan: userData.plan
        }
        setUser(authUser)
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error)
      setUser(null)
    } finally {
      setUserLoading(false)
    }
  }, [isAuthenticated, sessionHook?.data?.user?.email])

  // Create user in Supabase if they don't exist
  const createSupabaseUser = async (sessionUser: any) => {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: sessionUser.email!,
        user_metadata: {
          username: sessionUser.name || sessionUser.email!.split('@')[0],
        }
      })

      if (!error && data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            username: sessionUser.name || sessionUser.email!.split('@')[0],
            avatar_url: sessionUser.image,
            points: 10, // Starting points
            total_points_earned: 10,
            total_points_spent: 0,
            plan: 'free'
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        } else {
          // Award signup bonus
          await PointsService.awardSignupBonus(data.user.id)
        }
      }
    } catch (error) {
      console.error('Error creating Supabase user:', error)
    }
  }

  // Refresh user data (call after points transactions)
  const refreshUserData = useCallback(async () => {
    await fetchUserData()
  }, [fetchUserData])

  // Fetch user data when session changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData()
    } else {
      setUser(null)
    }
  }, [isAuthenticated, fetchUserData])

  const openLogin = useCallback(() => setIsLoginOpen(true), [])
  const closeLogin = useCallback(() => setIsLoginOpen(false), [])

  const login = useCallback((username: string, password: string) => {
    // 这是为 /admin 路由提供的传统登录方式
    if (username === 'admin' && password === 'admin123') {
      // 设置一个本地认证标记
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_auth', 'true')
        window.location.reload()
      }
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    // 清除本地认证标记
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_auth')
    }
    setUser(null)
    // 执行 NextAuth 登出
    signOut()
  }, [])

  const requireAuth = useCallback((onAuthed: () => void) => {
    if (isAuthenticated) {
      onAuthed()
    } else {
      openLogin()
    }
  }, [isAuthenticated, openLogin])

  const contextValue: AuthContextType = {
    isAuthenticated,
    authLoading,
    isLoginOpen,
    user,
    userLoading,
    refreshUserData,
    login,
    logout,
    openLogin,
    closeLogin,
    requireAuth,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
