'use client'

import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'

type AuthContextType = {
  isAuthenticated: boolean
  authLoading: boolean
  isLoginOpen: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  openLogin: () => void
  closeLogin: () => void
  requireAuth: (onAuthed: () => void) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const sessionHook = useSession()
  const isAuthenticated = !!sessionHook?.data
  const authLoading = sessionHook?.status === 'loading'

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
