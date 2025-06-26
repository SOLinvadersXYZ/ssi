"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"

interface UserContextType {
  isAuthenticated: boolean
  userId: string | null
  walletAddress: string | null
  email: string | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  isAuthenticated: false,
  userId: null,
  walletAddress: null,
  email: null,
  loading: true,
})

export const useUser = () => useContext(UserContext)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready, authenticated, user } = usePrivy()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ready) {
      setLoading(false)
    }
  }, [ready])

  const value = {
    isAuthenticated: authenticated,
    userId: user?.id || null,
    walletAddress: user?.wallet?.address || null,
    email: user?.email?.address || null,
    loading,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
