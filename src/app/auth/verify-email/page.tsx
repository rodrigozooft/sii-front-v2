import React, { Suspense } from 'react'
import EmailVerification from '@/components/auth/EmailVerification'
import type { Metadata } from 'next'
import { Spin } from 'antd'

export const metadata: Metadata = {
  title: 'Verify Email - SII Accounting System',
  description: 'Verify your email address for the AI Agentic Accounting System for Chile',
  robots: 'noindex, nofollow', // Don't index auth pages
}

function EmailVerificationFallback() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <Spin size="large" />
    </div>
  )
}

export default function VerifyEmailPage(): React.JSX.Element {
  return (
    <Suspense fallback={<EmailVerificationFallback />}>
      <EmailVerification />
    </Suspense>
  )
}