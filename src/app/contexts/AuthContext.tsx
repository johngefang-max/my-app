'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type AuthContextType = {
  isAuthenticated: boolean
  isLoginOpen: boolean
  login: () => void
  logout: () => void
  openLogin: () => void
  closeLogin: () => void
  requireAuth: (onAuthed: () => void) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('auth')
      setIsAuthenticated(saved === 'true')
    } catch {}
  }, [])

  const login = () => {
    setIsAuthenticated(true)
    try {
      localStorage.setItem('auth', 'true')
    } catch {}
    setIsLoginOpen(false)
  }

  const logout = () => {
    setIsAuthenticated(false)
    try {
      localStorage.removeItem('auth')
    } catch {}
  }

  const openLogin = () => setIsLoginOpen(true)
  const closeLogin = () => setIsLoginOpen(false)

  const requireAuth = (onAuthed: () => void) => {
    if (isAuthenticated) {
      onAuthed()
    } else {
      setIsLoginOpen(true)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoginOpen, login, logout, openLogin, closeLogin, requireAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}