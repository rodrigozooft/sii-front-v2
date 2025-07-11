import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import type { User, LoginResponse } from '@/lib/api/schemas'
import { authApi } from '@/lib/api/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    rut: string
    phone?: string
  }) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  updateUser: (user: User) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          const response: LoginResponse = await authApi.login({ email, password })
          
          // Extract token and user from LoginResponse
          if (!response.token || !response.user) {
            throw new Error('Login succeeded but token or user data is missing')
          }
          
          // Store token securely
          localStorage.setItem('auth_token', response.token.access_token)
          
          set((state) => {
            state.user = response.user!
            state.token = response.token!.access_token
            state.isAuthenticated = true
            state.isLoading = false
            state.error = null
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Login failed'
            state.isLoading = false
            state.isAuthenticated = false
          })
          throw error
        }
      },

      register: async (userData) => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })

        try {
          // Transform userData to match API expectations
          const apiPayload = {
            email: userData.email,
            password: userData.password,
            name: `${userData.first_name} ${userData.last_name}`,
            rut: userData.rut,
            phone: userData.phone,
          }
          
          const response: LoginResponse = await authApi.register(apiPayload)
          
          // Extract token and user from LoginResponse
          if (!response.token || !response.user) {
            throw new Error('Registration succeeded but token or user data is missing')
          }
          
          // Store token securely
          localStorage.setItem('auth_token', response.token.access_token)
          
          set((state) => {
            state.user = response.user!
            state.token = response.token!.access_token
            state.isAuthenticated = true
            state.isLoading = false
            state.error = null
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Registration failed'
            state.isLoading = false
            state.isAuthenticated = false
          })
          throw error
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear state regardless of API call success
          localStorage.removeItem('auth_token')
          set((state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
            state.error = null
          })
        }
      },

      clearError: () => {
        set((state) => {
          state.error = null
        })
      },

      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading
        })
      },

      updateUser: (user: User) => {
        set((state) => {
          state.user = user
        })
      },
    })),
    {
      name: 'auth-storage',
      // Only persist specific fields for security
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)