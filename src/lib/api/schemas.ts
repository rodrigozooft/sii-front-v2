import { z } from 'zod'

// ==========================================
// Request Types (based on documentation)
// ==========================================

// Registration request
export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  rut: z.string().optional(),
})

// Login request (for Firebase ID token validation)
export const LoginRequestSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().optional(),
  id_token: z.string().optional(),
})

// Google login request
export const GoogleLoginRequestSchema = z.object({
  id_token: z.string(),
})

// Phone login request
export const PhoneLoginRequestSchema = z.object({
  phone_number: z.string(),
  verification_code: z.string().optional(),
})

// Phone send code request
export const PhoneSendCodeRequestSchema = z.object({
  phone_number: z.string(),
})

// Phone verify code request
export const PhoneVerifyCodeRequestSchema = z.object({
  phone_number: z.string(),
  verification_code: z.string().length(6),
})

// Forgot password request
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
})

// Email verification request
export const EmailVerificationRequestSchema = z.object({
  verification_code: z.string(),
})

// Logout request
export const LogoutRequestSchema = z.object({
  token: z.string(),
})

// User update request
export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  phone: z.string().max(20).optional(),
  rut: z.string().max(12).optional(),
  avatar_url: z.string().optional(),
})

// ==========================================
// Response Types (based on documentation)
// ==========================================

// Token information
export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().nullable().optional(),
})

// Basic user information returned in authentication responses
export const UserResponseSchema = z.object({
  id: z.string(),
  firebase_uid: z.string(),
  email: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  rut: z.string().nullable(),
  avatar_url: z.string().nullable(),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Extended user profile
export const UserProfileSchema = UserResponseSchema.extend({
  company_count: z.number(),
  current_company_id: z.string().optional(),
  last_login: z.string().optional(),
})

// Main authentication response format used by most auth endpoints
export const LoginResponseSchema = z.object({
  message: z.string(),
  user: UserResponseSchema.nullable().optional(),
  token: TokenResponseSchema.nullable().optional(),
  instructions: z.record(z.string()).nullable().optional(),
})

// ==========================================
// Error Response Types
// ==========================================

// Standard error response format from the API
export const APIErrorSchema = z.object({
  detail: z.string(),
  type: z.string().optional(),
  code: z.string().optional(),
})

// Validation error with field-specific details
export const ValidationErrorSchema = z.object({
  detail: z.array(z.object({
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
    type: z.string(),
  })),
})

// ==========================================
// Multi-Factor Authentication Types
// ==========================================

// MFA enable request
export const MFAEnableRequestSchema = z.object({
  phone_number: z.string(),
})

// MFA verify request
export const MFAVerifyRequestSchema = z.object({
  code: z.string().length(6),
})

// MFA response
export const MFAResponseSchema = z.object({
  enabled: z.boolean(),
  backup_codes: z.array(z.string()).optional(),
})

// ==========================================
// Chilean-Specific Types
// ==========================================

// Chilean RUT validation
export const ChileanRUTSchema = z.object({
  number: z.string(),
  checkDigit: z.string(),
  formatted: z.string(),
  isValid: z.boolean(),
})

// ==========================================
// Utility Response Types
// ==========================================

// Paginated response
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    per_page: z.number(),
    has_next: z.boolean(),
    has_prev: z.boolean(),
  })

// Generic API response wrapper
export const APIResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: APIErrorSchema.optional(),
    meta: z.record(z.unknown()).optional(),
  })

// ==========================================
// Type Exports
// ==========================================

// Request types
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type GoogleLoginRequest = z.infer<typeof GoogleLoginRequestSchema>
export type PhoneLoginRequest = z.infer<typeof PhoneLoginRequestSchema>
export type PhoneSendCodeRequest = z.infer<typeof PhoneSendCodeRequestSchema>
export type PhoneVerifyCodeRequest = z.infer<typeof PhoneVerifyCodeRequestSchema>
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>
export type EmailVerificationRequest = z.infer<typeof EmailVerificationRequestSchema>
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>

// Response types
export type TokenResponse = z.infer<typeof TokenResponseSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type APIError = z.infer<typeof APIErrorSchema>
export type ValidationError = z.infer<typeof ValidationErrorSchema>

// MFA types
export type MFAEnableRequest = z.infer<typeof MFAEnableRequestSchema>
export type MFAVerifyRequest = z.infer<typeof MFAVerifyRequestSchema>
export type MFAResponse = z.infer<typeof MFAResponseSchema>

// Chilean types
export type ChileanRUT = z.infer<typeof ChileanRUTSchema>

// Utility types
export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  per_page: number
  has_next: boolean
  has_prev: boolean
}

export type APIResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: APIError
  meta?: Record<string, unknown>
}