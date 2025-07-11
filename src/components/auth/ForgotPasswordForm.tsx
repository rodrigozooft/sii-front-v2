'use client'
import React, { useState } from 'react'
import { useAuthForm } from '../../hooks/useAuthForm'
import { InputField } from '../common/InputField'
import { SubmitButton } from '../common/SubmitButton'
import { ErrorAlert } from '../common/ErrorAlert'
import { authService } from '../../services/authService'
import sanitizeHtml from 'sanitize-html'

interface ForgotPasswordFormData {
  email: string
}

const initialValues: ForgotPasswordFormData = {
  email: '',
}

function validateForgotPasswordForm(values: ForgotPasswordFormData) {
  const errors: Partial<Record<keyof ForgotPasswordFormData, string>> = {}

  if (!values.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address'
  }

  return errors
}

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false)

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
    validate: validateForgotPasswordForm,
    onSubmit: async (formData) => {
      const sanitizedEmail = sanitizeHtml((formData.email as string).toLowerCase().trim(), { allowedTags: [], allowedAttributes: {} })
      
      await authService.forgotPassword(sanitizedEmail)
      setIsSuccess(true)
    }
  })

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Sent!</h2>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </p>
          <a href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
            Back to Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
        <p className="text-gray-600 mt-2">Enter your email to reset your password</p>
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

        <ErrorAlert 
          error={submitError} 
          onDismiss={clearErrors}
          title="Reset Failed"
        />

        <SubmitButton 
          loading={isSubmitting}
          loadingText="Sending Reset Email..."
        >
          Send Reset Email
        </SubmitButton>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <a href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordForm