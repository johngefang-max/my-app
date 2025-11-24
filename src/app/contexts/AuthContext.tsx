'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { SessionProvider, useSession, signOut as nextAuthSignOut } from 'next-auth/react'

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
  return (
    <SessionProvider>
      <InnerAuthProvider>{children}</InnerAuthProvider>
    </SessionProvider>
  )
}

function InnerAuthProvider({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const cookieValue = (typeof document !== 'undefined')
    ? document.cookie.split('; ').find(row => row.startsWith('auth='))?.split('=')[1]
    : undefined
  const localAuthed = cookieValue === 'true'
  const sessionAuthed = status === 'authenticated'
  const authedComputed = localAuthed || sessionAuthed

  const [isLoginOpen, setIsLoginOpen] = useState(() => {
    try {
      const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
      const needLogin = sp.get('login') === '1'
      return needLogin && !(authedComputed || false)
    } catch {
      return false
    }
  })

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
    nextAuthSignOut()
  }

  const openLogin = () => setIsLoginOpen(true)
  const closeLogin = () => setIsLoginOpen(false)

  const requireAuth = (onAuthed: () => void) => {
    if (isAuthenticated || authedComputed) {
      onAuthed()
    } else {
      setIsLoginOpen(true)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: isAuthenticated || authedComputed, authLoading: status === 'loading', isLoginOpen, login, logout, openLogin, closeLogin, requireAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
