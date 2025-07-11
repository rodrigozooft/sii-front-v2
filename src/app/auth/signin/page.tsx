import React from 'react'
import { SignInForm } from '@/components/auth/SignInForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - SII Accounting System',
  description: 'Access your AI Agentic Accounting System for Chile account',
  keywords: ['signin', 'login', 'access', 'sii', 'chile', 'accounting'],
  robots: 'noindex, nofollow', // Don't index auth pages
}

export default function SigninPage(): React.JSX.Element {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <SignInForm />
    </div>
  )
}