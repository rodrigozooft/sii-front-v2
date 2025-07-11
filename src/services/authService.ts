import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import {
  RegisterRequest,
  LoginResponse,
  UserProfile,
  UserUpdate,
  LoginResponseSchema,
  UserProfileSchema,
  UserResponseSchema,
  type UserResponse
} from '../lib/api/schemas'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'

class AuthService {
  
  // Register new user (direct API call)
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Registration failed')
      }

      const data = await response.json()
      return LoginResponseSchema.parse(data)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  // Sign in with Firebase and get API token
  async signIn(email: string, password: string): Promise<LoginResponse> {
    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // 2. Get Firebase ID token
      const idToken = await userCredential.user.getIdToken()
      
      // 3. Exchange for API access token
      const response = await fetch(`${API_BASE}/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Sign in failed')
      }

      const data = await response.json()
      return LoginResponseSchema.parse(data)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth)
      // Clear local storage
      localStorage.removeItem('sii_api_token')
      localStorage.removeItem('sii_user_data')
      localStorage.removeItem('sii_token_expiry')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  // Get user profile
  async getProfile(apiToken: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to get profile')
      }

      const data = await response.json()
      return UserProfileSchema.parse(data)
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  }

  // Update user profile
  async updateProfile(apiToken: string, updates: UserUpdate): Promise<UserResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to update profile')
      }

      const data = await response.json()
      return UserResponseSchema.parse(data)
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // Verify email
  async verifyEmail(verificationCode: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verification_code: verificationCode }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Email verification failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Email verification error:', error)
      throw error
    }
  }

  // Resend verification email
  async resendVerificationEmail(apiToken: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/resend-verification-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to resend verification email')
      }

      return await response.json()
    } catch (error) {
      console.error('Resend verification email error:', error)
      throw error
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Password reset request failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  }

  // Listen to Firebase auth state changes
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('sii_token_expiry')
    if (!expiry) return true
    return Date.now() > parseInt(expiry, 10)
  }

  // Get stored API token
  getStoredToken(): string | null {
    if (this.isTokenExpired()) {
      this.clearStoredAuth()
      return null
    }
    return localStorage.getItem('sii_api_token')
  }

  // Get stored user data
  getStoredUser(): UserResponse | null {
    try {
      const userJson = localStorage.getItem('sii_user_data')
      if (!userJson || this.isTokenExpired()) {
        this.clearStoredAuth()
        return null
      }
      return JSON.parse(userJson) as UserResponse
    } catch {
      this.clearStoredAuth()
      return null
    }
  }

  // Store authentication data
  storeAuthData(token: string, expiresIn: number, user: UserResponse): void {
    const expiryTime = Date.now() + (expiresIn * 1000)
    
    localStorage.setItem('sii_api_token', token)
    localStorage.setItem('sii_user_data', JSON.stringify(user))
    localStorage.setItem('sii_token_expiry', expiryTime.toString())
  }

  // Clear stored authentication data
  clearStoredAuth(): void {
    localStorage.removeItem('sii_api_token')
    localStorage.removeItem('sii_user_data')
    localStorage.removeItem('sii_token_expiry')
  }
}

export const authService = new AuthService()