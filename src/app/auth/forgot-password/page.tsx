import React from 'react'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password - SII Accounting System',
  description: 'Reset your password for the AI Agentic Accounting System for Chile',
  robots: 'noindex, nofollow', // Don't index auth pages
}

export default function ForgotPasswordPage(): React.JSX.Element {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <ForgotPasswordForm />
    </div>
  )
}