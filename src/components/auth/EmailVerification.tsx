'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { authService } from '../../services/authService'
import { useAuth } from '../../contexts/AuthContext'

export function EmailVerification() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect(() => {
    if (code) {
      verifyEmail(code)
    } else {
      setStatus('error')
      setMessage('Verification code not found')
    }
  }, [code])

  const verifyEmail = async (verificationCode: string) => {
    try {
      const response = await authService.verifyEmail(verificationCode)
      setStatus('success')
      setMessage(response.message || 'Email verified successfully!')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Email verification failed')
    }
  }

  const handleResendEmail = async () => {
    if (!user) return
    
    try {
      const token = authService.getStoredToken()
      if (!token) {
        setMessage('Please sign in to resend verification email')
        return
      }

      const response = await authService.resendVerificationEmail(token)
      setMessage(response.message || 'Verification email sent!')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to resend verification email')
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <a href="/dashboard" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Go to Dashboard
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="space-y-2">
                <button 
                  onClick={handleResendEmail}
                  className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Resend Verification Email
                </button>
                <a href="/auth/signin" className="block text-blue-600 hover:text-blue-500 font-medium">
                  Back to Sign In
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailVerification