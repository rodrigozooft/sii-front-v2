import { z } from 'zod'

/**
 * Chilean RUT (Rol Único Tributario) validation utilities
 * Implements secure, type-safe validation for Chilean tax IDs
 */

// RUT validation schema
export const RutSchema = z.string().refine(
  (value) => isValidRut(value),
  { message: 'Invalid Chilean RUT format' }
)

/**
 * Validates a Chilean RUT
 * @param rut - RUT string in format "12345678-9" or "12.345.678-9"
 * @returns boolean indicating if RUT is valid
 */
export function isValidRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false
  
  // Clean RUT: remove dots and convert to uppercase
  const cleanRut = rut.replace(/\./g, '').toUpperCase()
  
  // Validate format: 7-8 digits, hyphen, then check digit (0-9 or K)
  const rutRegex = /^(\d{7,8})-([0-9K])$/
  const match = cleanRut.match(rutRegex)
  
  if (!match || !match[1] || !match[2]) return false
  
  const [, rutNumber, checkDigit] = match
  
  // Calculate expected check digit
  const expectedCheckDigit = calculateCheckDigit(rutNumber)
  
  return checkDigit === expectedCheckDigit
}

/**
 * Calculates the check digit for a Chilean RUT
 * @param rutNumber - RUT number as string (without check digit)
 * @returns check digit as string ('0'-'9' or 'K')
 */
function calculateCheckDigit(rutNumber: string): string {
  const digits = rutNumber.split('').map(Number).reverse()
  let sum = 0
  let multiplier = 2
  
  for (const digit of digits) {
    sum += digit * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  
  const remainder = sum % 11
  const checkDigit = 11 - remainder
  
  if (checkDigit === 11) return '0'
  if (checkDigit === 10) return 'K'
  return checkDigit.toString()
}

/**
 * Formats a RUT string with proper punctuation
 * @param rut - RUT string (with or without formatting)
 * @returns formatted RUT string "12.345.678-9"
 */
export function formatRut(rut: string): string {
  if (!rut) return ''
  
  // Clean RUT
  const cleanRut = rut.replace(/[^\dK]/gi, '').toUpperCase()
  
  if (cleanRut.length < 8) return cleanRut
  
  // Split into number and check digit
  const rutNumber = cleanRut.slice(0, -1)
  const checkDigit = cleanRut.slice(-1)
  
  // Add dots every 3 digits from right to left
  const formattedNumber = rutNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  return `${formattedNumber}-${checkDigit}`
}

/**
 * Cleans RUT string by removing all non-alphanumeric characters
 * @param rut - RUT string with any formatting
 * @returns clean RUT string "12345678-9"
 */
export function cleanRut(rut: string): string {
  if (!rut) return ''
  
  const cleaned = rut.replace(/[^\dK]/gi, '').toUpperCase()
  
  if (cleaned.length < 8) return cleaned
  
  const rutNumber = cleaned.slice(0, -1)
  const checkDigit = cleaned.slice(-1)
  
  return `${rutNumber}-${checkDigit}`
}

/**
 * Chilean phone number validation
 * @param phone - Phone number string
 * @returns boolean indicating if phone number is valid
 */
export function isValidChileanPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  
  // Chilean mobile: +56 9 XXXX XXXX or +569XXXXXXXX
  // Chilean landline: +56 2 XXXX XXXX or +5622XXXXXXX (Santiago)
  const phoneRegex = /^\+56[29]\d{8}$/
  
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Formats Chilean phone number
 * @param phone - Phone number string
 * @returns formatted phone number "+56 9 1234 5678"
 */
export function formatChileanPhone(phone: string): string {
  if (!phone) return ''
  
  // Clean phone number
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Add country code if missing
  let fullPhone = cleanPhone
  if (!cleanPhone.startsWith('56')) {
    fullPhone = `56${cleanPhone}`
  }
  
  if (fullPhone.length === 11) {
    // Mobile: +56 9 XXXX XXXX
    if (fullPhone[2] === '9') {
      return `+${fullPhone.slice(0, 2)} ${fullPhone[2]} ${fullPhone.slice(3, 7)} ${fullPhone.slice(7)}`
    }
    // Landline: +56 2 XXXX XXXX
    if (fullPhone[2] === '2') {
      return `+${fullPhone.slice(0, 2)} ${fullPhone[2]} ${fullPhone.slice(3, 7)} ${fullPhone.slice(7)}`
    }
  }
  
  return phone
}

/**
 * Chilean currency formatting
 * @param amount - Amount in CLP
 * @returns formatted currency string "$ 1.234.567"
 */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Validates Chilean postal code (ZIP code)
 * @param postalCode - Postal code string
 * @returns boolean indicating if postal code is valid
 */
export function isValidChileanPostalCode(postalCode: string): boolean {
  if (!postalCode || typeof postalCode !== 'string') return false
  
  // Chilean postal codes are 7 digits: XXXXXXX
  const postalCodeRegex = /^\d{7}$/
  
  return postalCodeRegex.test(postalCode)
}

// Export validation schemas for use with react-hook-form
export const ChileanPhoneSchema = z.string().refine(
  (value) => isValidChileanPhone(value),
  { message: 'Invalid Chilean phone number format' }
)

export const ChileanPostalCodeSchema = z.string().refine(
  (value) => isValidChileanPostalCode(value),
  { message: 'Invalid Chilean postal code' }
)