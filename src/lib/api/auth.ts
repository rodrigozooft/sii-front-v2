import { apiClient, apiRequest } from './client'
import {
  AuthResponseSchema,
  LoginResponseSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  PhoneLoginRequestSchema,
  VerifyCodeRequestSchema,
  UserSchema,
  type LoginRequest,
  type RegisterRequest,
  type PhoneLoginRequest,
  type VerifyCodeRequest,
  type AuthResponse,
  type LoginResponse,
  type User,
} from './schemas'
import { z } from 'zod'

// Helper function to transform LoginResponse to AuthResponse
function transformLoginResponse(loginResponse: LoginResponse): AuthResponse {
  if (!loginResponse.token || !loginResponse.user) {
    throw new Error(`Authentication failed: ${loginResponse.message}`)
  }
  
  return {
    access_token: loginResponse.token.access_token,
    token_type: loginResponse.token.token_type,
    expires_in: loginResponse.token.expires_in,
    user: loginResponse.user,
  }
}

// Auth API endpoints
export const authApi = {
  // Email/password login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const validatedCredentials = LoginRequestSchema.parse(credentials)
    
    const loginResponse = await apiRequest(
      () => apiClient.post('/auth/login/email', validatedCredentials),
      LoginResponseSchema
    )
    
    return transformLoginResponse(loginResponse)
  },

  // User registration
  register: async (userData: RegisterRequest | {
    email: string
    password: string
    name: string
    rut: string
    phone?: string
  }): Promise<AuthResponse> => {
    const validatedUserData = RegisterRequestSchema.parse(userData)
    
    const loginResponse = await apiRequest(
      () => apiClient.post('/auth/register', validatedUserData),
      LoginResponseSchema
    )
    
    return transformLoginResponse(loginResponse)
  },

  // Phone login (send code)
  sendPhoneCode: async (phoneData: PhoneLoginRequest): Promise<{ message: string }> => {
    const validatedPhoneData = PhoneLoginRequestSchema.parse(phoneData)
    
    return apiRequest(
      () => apiClient.post('/auth/phone/send-code', validatedPhoneData),
      z.object({ message: z.string() })
    )
  },

  // Verify phone code and login
  verifyPhoneCode: async (verificationData: VerifyCodeRequest): Promise<AuthResponse> => {
    const validatedVerificationData = VerifyCodeRequestSchema.parse(verificationData)
    
    const loginResponse = await apiRequest(
      () => apiClient.post('/auth/phone/verify-code', validatedVerificationData),
      LoginResponseSchema
    )
    
    return transformLoginResponse(loginResponse)
  },

  // Google OAuth URL
  getGoogleAuthUrl: async (): Promise<{ auth_url: string }> => {
    return apiRequest(
      () => apiClient.get('/auth/google/auth-url'),
      z.object({ auth_url: z.string() })
    )
  },

  // Google OAuth callback
  googleCallback: async (code: string, state: string): Promise<AuthResponse> => {
    const loginResponse = await apiRequest(
      () => apiClient.post('/auth/google/callback', { code, state }),
      LoginResponseSchema
    )
    
    return transformLoginResponse(loginResponse)
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    return apiRequest(
      () => apiClient.get('/auth/me'),
      UserSchema
    )
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    return apiRequest(
      () => apiClient.put('/auth/profile', profileData),
      UserSchema
    )
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
    localStorage.removeItem('auth_token')
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return apiRequest(
      () => apiClient.post('/auth/verify-email', { token }),
      z.object({ message: z.string() })
    )
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<{ message: string }> => {
    return apiRequest(
      () => apiClient.post('/auth/resend-verification-email'),
      z.object({ message: z.string() })
    )
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiRequest(
      () => apiClient.post('/auth/forgot-password', { email }),
      z.object({ message: z.string() })
    )
  },

  // Enable MFA
  enableMFA: async (): Promise<{ qr_code: string; backup_codes: string[] }> => {
    return apiRequest(
      () => apiClient.post('/auth/mfa/enable'),
      z.object({
        qr_code: z.string(),
        backup_codes: z.array(z.string())
      })
    )
  },

  // Verify MFA
  verifyMFA: async (code: string): Promise<{ verified: boolean }> => {
    return apiRequest(
      () => apiClient.post('/auth/mfa/verify', { code }),
      z.object({ verified: z.boolean() })
    )
  },
}