import { z } from 'zod'

// User schemas based on API v2 structure
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  first_name: z.string(),
  last_name: z.string(),
  rut: z.string(),
  is_verified: z.boolean(),
  mfa_enabled: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const CompanySchema = z.object({
  id: z.string(),
  rut: z.string(),
  name: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  industry: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Authentication schemas
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  rut: z.string().optional(),
  phone: z.string().optional(),
})

export const PhoneLoginRequestSchema = z.object({
  phone: z.string().regex(/^\+56\d{9}$/, 'Invalid Chilean phone format'),
})

export const VerifyCodeRequestSchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
})

// Token response schema (nested in LoginResponse)
export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
})

// API Login response schema (actual format from API)
export const LoginResponseSchema = z.object({
  message: z.string(),
  user: UserSchema.optional(),
  token: TokenResponseSchema.optional(),
  instructions: z.record(z.string()).optional(),
})

// Legacy AuthResponse schema (for backward compatibility)
export const AuthResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  user: UserSchema,
})

// Banking schemas
export const BankAccountSchema = z.object({
  id: z.string(),
  bank_name: z.string(),
  account_type: z.string(),
  account_number: z.string(),
  currency: z.enum(['CLP', 'USD', 'EUR']),
  balance: z.number(),
  is_active: z.boolean(),
  last_sync: z.string().optional(),
})

// Document schemas
export const DocumentSchema = z.object({
  id: z.string(),
  type: z.enum(['compra', 'venta', 'boleta_honorarios']),
  folio: z.string(),
  rut_emisor: z.string(),
  razon_social: z.string(),
  fecha: z.string(),
  monto_neto: z.number(),
  monto_iva: z.number(),
  monto_total: z.number(),
  estado: z.string(),
  created_at: z.string(),
})

// Service connection schemas
export const ServiceConnectionSchema = z.object({
  id: z.string(),
  service_type: z.enum(['sii', 'bank']),
  service_name: z.string(),
  is_active: z.boolean(),
  last_sync: z.string().optional(),
  credentials_stored: z.boolean(),
  created_at: z.string(),
})

// Export types
export type User = z.infer<typeof UserSchema>
export type Company = z.infer<typeof CompanySchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type PhoneLoginRequest = z.infer<typeof PhoneLoginRequestSchema>
export type VerifyCodeRequest = z.infer<typeof VerifyCodeRequestSchema>
export type TokenResponse = z.infer<typeof TokenResponseSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type BankAccount = z.infer<typeof BankAccountSchema>
export type Document = z.infer<typeof DocumentSchema>
export type ServiceConnection = z.infer<typeof ServiceConnectionSchema>