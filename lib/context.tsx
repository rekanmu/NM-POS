"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User, AppData, CartItem } from '@/lib/data'
import { getDB, ROLES } from '@/lib/data'

interface AppContextType {
  db: AppData
  currentUser: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  currentPage: string
  setCurrentPage: (page: string) => void
  selectedBranch: string
  setSelectedBranch: (b: string) => void
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  selectedPayMethod: string
  setSelectedPayMethod: (m: string) => void
  canAccess: (page: string) => boolean
  forceUpdate: () => void
  toasts: { id: number; msg: string; type: string }[]
  toast: (msg: string, type?: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db] = useState(() => getDB())
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedPayMethod, setSelectedPayMethod] = useState('Tunai')
  const [, setTick] = useState(0)
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([])

  const forceUpdate = useCallback(() => setTick(t => t + 1), [])

  const toast = useCallback((msg: string, type = '') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const login = useCallback((username: string, password: string): boolean => {
    const user = db.users.find(u => u.username === username && u.pass === password && u.active)
    if (!user) return false
    user.lastLogin = new Date().toISOString()
    setCurrentUser(user)
    if (user.branch !== 'all') {
      setSelectedBranch(user.branch)
    }
    return true
  }, [db])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setCart([])
    setCurrentPage('dashboard')
    setSelectedBranch('all')
    setSelectedPayMethod('Tunai')
  }, [])

  const canAccess = useCallback((page: string): boolean => {
    if (!currentUser) return false
    return ROLES[currentUser.role]?.pages.includes(page) ?? false
  }, [currentUser])

  return (
    <AppContext.Provider value={{
      db, currentUser, login, logout,
      currentPage, setCurrentPage,
      selectedBranch, setSelectedBranch,
      cart, setCart,
      selectedPayMethod, setSelectedPayMethod,
      canAccess, forceUpdate,
      toasts, toast,
    }}>
      {children}
    </AppContext.Provider>
  )
}
