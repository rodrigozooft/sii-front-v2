import { z } from 'zod'

// User schemas based on API v2 structure (matches actual API response)
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(), // Can be null or string (like "+56931402167")
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  name: z.string(), // Backend always returns 'name' field
  rut: z.string(),
  firebase_uid: z.string(),
  avatar_url: z.string().nullable(),
  is_active: z.boolean(),
  is_verified: z.boolean(),
  mfa_enabled: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string(),
}).transform((data) => {
  // Handle case where backend returns 'name' instead of first_name/last_name
  if (data.name && !data.first_name && !data.last_name) {
    const nameParts = data.name.split(' ')
    return {
      ...data,
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
    }
  }
  return data
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
  name: z.string().min(1),
  rut: z.string().regex(/^\d{7,8}-[\dK]$/, 'Invalid RUT format'),
  phone: z.string().optional(),
})

export const PhoneLoginRequestSchema = z.object({
  phone: z.string().regex(/^\+56\d{9}$/, 'Invalid Chilean phone format'),
})

export const VerifyCodeRequestSchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
})

// Token object schema (as returned by backend)
export const TokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().nullable(),
})

// Backend LoginResponse schema (matches sii-api-v2 structure)
export const LoginResponseSchema = z.object({
  message: z.string(),
  user: UserSchema.nullable().optional(),
  token: TokenSchema.nullable().optional(),
  instructions: z.record(z.string()).optional(),
})

// Legacy flat structure for backward compatibility
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
export type Token = z.infer<typeof TokenSchema>
export type LoginResponse = z.infer<typeof LoginResponseSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type BankAccount = z.infer<typeof BankAccountSchema>
export type Document = z.infer<typeof DocumentSchema>
export type ServiceConnection = z.infer<typeof ServiceConnectionSchema>