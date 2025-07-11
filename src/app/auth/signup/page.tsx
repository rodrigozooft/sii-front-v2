import React from 'react'
import { SignUpForm } from '@/components/auth/SignUpForm'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - SII Accounting System',
  description: 'Create your account for the AI Agentic Accounting System for Chile',
  keywords: ['signup', 'register', 'sii', 'chile', 'accounting', 'rut'],
  robots: 'noindex, nofollow', // Don't index auth pages
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function SignupPage(): React.JSX.Element {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <SignUpForm />
    </div>
  )
}