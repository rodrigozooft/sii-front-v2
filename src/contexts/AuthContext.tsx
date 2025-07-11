'use client'
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { authService } from '../services/authService'
import { UserResponse, RegisterRequest } from '../lib/api/schemas'

interface AuthState {
  firebaseUser: FirebaseUser | null
  user: UserResponse | null
  apiToken: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  signUp: (userData: RegisterRequest) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<UserResponse>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    apiToken: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  })

  // Update authentication state
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates }
      return {
        ...newState,
        isAuthenticated: !!(newState.user && newState.apiToken),
      }
    })
  }, [])

  // Sign up function (direct API call)
  const signUp = useCallback(async (userData: RegisterRequest) => {
    updateAuthState({ loading: true, error: null })
    
    try {
      const response = await authService.register(userData)
      
      if (response.token && response.user && response.token !== null && response.user !== null) {
        // Store authentication data
        authService.storeAuthData(
          response.token.access_token,
          response.token.expires_in,
          response.user
        )
        
        updateAuthState({
          user: response.user,
          apiToken: response.token.access_token,
          loading: false,
        })
      } else {
        throw new Error('Registration succeeded but token or user data is missing')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      updateAuthState({ error: errorMessage, loading: false })
      throw error
    }
  }, [updateAuthState])

  // Sign in function (Firebase → API token exchange)
  const signIn = useCallback(async (email: string, password: string) => {
    updateAuthState({ loading: true, error: null })
    
    try {
      const response = await authService.signIn(email, password)
      
      if (response.token && response.user && response.token !== null && response.user !== null) {
        // Store authentication data
        authService.storeAuthData(
          response.token.access_token,
          response.token.expires_in,
          response.user
        )
        
        updateAuthState({
          user: response.user,
          apiToken: response.token.access_token,
          loading: false,
        })
      } else {
        throw new Error('Sign in succeeded but token or user data is missing')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      updateAuthState({ error: errorMessage, loading: false })
      throw error
    }
  }, [updateAuthState])

  // Sign out function
  const signOut = useCallback(async () => {
    updateAuthState({ loading: true })
    
    try {
      await authService.signOut()
      updateAuthState({
        firebaseUser: null,
        user: null,
        apiToken: null,
        loading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      updateAuthState({ error: errorMessage, loading: false })
    }
  }, [updateAuthState])

  // Clear error function
  const clearError = useCallback(() => {
    updateAuthState({ error: null })
  }, [updateAuthState])

  // Refresh profile function
  const refreshProfile = useCallback(async () => {
    if (!state.apiToken) return

    try {
      const profile = await authService.getProfile(state.apiToken)
      updateAuthState({ user: profile })
      // Update stored user data
      authService.storeAuthData(state.apiToken, 3600, profile) // Use current token with default expiry
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }
  }, [state.apiToken, updateAuthState])

  // Update profile function (optimistic update)
  const updateProfile = useCallback((updates: Partial<UserResponse>) => {
    setState(prev => {
      if (!prev.user || !prev.apiToken) return prev
      
      const updatedUser = { ...prev.user, ...updates }
      // Update stored user data
      authService.storeAuthData(prev.apiToken, 3600, updatedUser) // Use current token with default expiry
      
      return {
        ...prev,
        user: updatedUser,
      }
    })
  }, [])

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      updateAuthState({ firebaseUser })
      
      // If Firebase user signs out, clear everything
      if (!firebaseUser) {
        authService.clearStoredAuth()
        updateAuthState({
          user: null,
          apiToken: null,
          loading: false,
        })
      }
    })

    // Load stored auth data
    const storedToken = authService.getStoredToken()
    const storedUser = authService.getStoredUser()
    
    if (storedToken && storedUser) {
      updateAuthState({
        user: storedUser,
        apiToken: storedToken,
        loading: false,
      })
    } else {
      updateAuthState({ loading: false })
    }

    return unsubscribe
  }, [updateAuthState])

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    clearError,
    refreshProfile,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}