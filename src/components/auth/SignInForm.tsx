'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthForm } from '../../hooks/useAuthForm'
import { InputField } from '../common/InputField'
import { SubmitButton } from '../common/SubmitButton'
import { ErrorAlert } from '../common/ErrorAlert'
import sanitizeHtml from 'sanitize-html'

interface SignInFormData {
  email: string
  password: string
  rememberMe: boolean
}

const initialValues: SignInFormData = {
  email: '',
  password: '',
  rememberMe: false,
}

function validateSignInForm(values: SignInFormData) {
  const errors: Partial<Record<keyof SignInFormData, string>> = {}

  if (!values.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!values.password) {
    errors.password = 'Password is required'
  }

  return errors
}

export function SignInForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

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
    validate: validateSignInForm,
    onSubmit: async (formData) => {
      // Sanitize email before sending
      const sanitizedEmail = sanitizeHtml((formData.email as string).toLowerCase().trim(), { allowedTags: [], allowedAttributes: {} })
      
      await signIn(sanitizedEmail, formData.password as string)
      
      // Redirect to dashboard on success
      router.push('/dashboard')
    }
  })

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
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

        <div className="relative">
          <InputField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={values.password as string}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L18 18" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={values.rememberMe as boolean}
              onChange={(e) => handleChange('rememberMe', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>

          <a 
            href="/auth/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Forgot password?
          </a>
        </div>

        <ErrorAlert 
          error={submitError} 
          onDismiss={clearErrors}
          title="Sign In Failed"
        />

        <SubmitButton 
          loading={isSubmitting}
          loadingText="Signing In..."
        >
          Sign In
        </SubmitButton>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a href="/auth/signup" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}