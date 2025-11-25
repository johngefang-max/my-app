'use client'

import { createContext, useContext, ReactNode, useState, useCallback } from 'react'

// This context is now deprecated in favor of the Zustand store
// but kept for compatibility with existing components

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

  const openLogin = useCallback(() => setIsLoginOpen(true), [])
  const closeLogin = useCallback(() => setIsLoginOpen(false), [])

  const contextValue: AuthContextType = {
    isAuthenticated: false,
    authLoading: false,
    isLoginOpen,
    login: () => false,
    logout: () => {},
    openLogin,
    closeLogin,
    requireAuth: () => {},
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
