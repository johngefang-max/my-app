'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type AuthContextType = {
  isAuthenticated: boolean
  isLoginOpen: boolean
  login: (username: string, password: string) => boolean
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
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth='))
        ?.split('=')[1]
      setIsAuthenticated(cookieValue === 'true')
    } catch {}
  }, [])

  const login = (username: string, password: string) => {
    const ok = username === 'johnfang' && password === 'fang682668'
    if (ok) {
      setIsAuthenticated(true)
      try {
        const expires = new Date()
        expires.setDate(expires.getDate() + 30)
        document.cookie = `auth=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
      } catch {}
      setIsLoginOpen(false)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    try {
      document.cookie = `auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
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