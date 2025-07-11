'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthForm } from '../../hooks/useAuthForm'
import { InputField } from '../common/InputField'
import { SubmitButton } from '../common/SubmitButton'
import { ErrorAlert } from '../common/ErrorAlert'
import { RegisterRequest } from '../../lib/api/schemas'
import { RutSchema, formatRut, cleanRut, ChileanPhoneSchema } from '@/utils/chile'
import sanitizeHtml from 'sanitize-html'

interface SignUpFormData extends RegisterRequest {
  confirmPassword: string
  acceptTerms: boolean
}

const initialValues: SignUpFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  rut: '',
  acceptTerms: false,
}

// Validation function
function validateSignUpForm(values: SignUpFormData) {
  const errors: Partial<Record<keyof SignUpFormData, string>> = {}

  // Email validation
  if (!values.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address'
  }

  // Name validation
  if (!values.name) {
    errors.name = 'Name is required'
  } else if (values.name.length < 2) {
    errors.name = 'Name must be at least 2 characters long'
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required'
  } else {
    if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])/.test(values.password)) {
      errors.password = 'Password must contain at least one lowercase letter'
    } else if (!/(?=.*[A-Z])/.test(values.password)) {
      errors.password = 'Password must contain at least one uppercase letter'
    } else if (!/(?=.*\d)/.test(values.password)) {
      errors.password = 'Password must contain at least one digit'
    }
  }

  // Confirm password validation
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  // Phone validation (optional)
  if (values.phone) {
    try {
      ChileanPhoneSchema.parse(values.phone)
    } catch {
      errors.phone = 'Please enter a valid Chilean phone number (+56912345678)'
    }
  }

  // RUT validation (optional)
  if (values.rut) {
    try {
      RutSchema.parse(values.rut)
    } catch {
      errors.rut = 'Please enter a valid Chilean RUT (12345678-9)'
    }
  }

  // Terms validation
  if (!values.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions'
  }

  return errors
}

export function SignUpForm() {
  const { signUp } = useAuth()
  const router = useRouter()

  const {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    clearErrors
  } = useAuthForm({
    initialValues,
    validate: validateSignUpForm,
    onSubmit: async (formData) => {
      // Sanitize and prepare data for API
      const registerData: RegisterRequest = {
        email: sanitizeHtml((formData.email as string).toLowerCase().trim(), { allowedTags: [], allowedAttributes: {} }),
        password: formData.password as string, // Don't sanitize password
        name: sanitizeHtml((formData.name as string).trim(), { allowedTags: [], allowedAttributes: {} }),
        rut: formData.rut ? cleanRut(formData.rut as string) : undefined,
        phone: formData.phone ? sanitizeHtml((formData.phone as string).replace(/\s/g, ''), { allowedTags: [], allowedAttributes: {} }) : undefined,
      }

      await signUp(registerData)
      
      // Redirect to dashboard on success
      router.push('/dashboard')
    }
  })

  const handleRutChange = (value: string) => {
    // Sanitize input to prevent XSS
    const sanitizedValue = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    const cleanedRut = cleanRut(sanitizedValue)
    const formattedRut = formatRut(cleanedRut)
    handleChange('rut', formattedRut)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-600 mt-2">Join the SII AI Agentic Accounting System</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email"
          type="email"
          name="email"
          value={values.email as string}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
          placeholder="Enter your email"
          autoComplete="email"
        />

        <InputField
          label="Full Name"
          type="text"
          name="name"
          value={values.name as string}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
          placeholder="Enter your full name"
          autoComplete="name"
        />

        <InputField
          label="Password"
          type="password"
          name="password"
          value={values.password as string}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          required
          placeholder="Create a password"
          autoComplete="new-password"
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
        />

        <InputField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={values.confirmPassword as string}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          required
          placeholder="Confirm your password"
          autoComplete="new-password"
        />

        <InputField
          label="Phone Number"
          type="tel"
          name="phone"
          value={values.phone as string}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="+56912345678"
          autoComplete="tel"
          helperText="Optional - Include country code"
        />

        <InputField
          label="RUT (Chilean Tax ID)"
          type="text"
          name="rut"
          value={values.rut as string}
          onChange={(e) => handleRutChange(e.target.value)}
          error={errors.rut}
          placeholder="12345678-9"
          helperText="Optional - Chilean tax identification number"
        />

        <div className="space-y-2">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={values.acceptTerms as boolean}
              onChange={(e) => handleChange('acceptTerms', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I accept the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
          )}
        </div>

        <ErrorAlert 
          error={submitError} 
          onDismiss={clearErrors}
          title="Registration Failed"
        />

        <SubmitButton 
          loading={isSubmitting}
          loadingText="Creating Account..."
        >
          Create Account
        </SubmitButton>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}