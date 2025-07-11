import React from 'react'
import SignupForm from '@/components/auth/signup-form'
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
  return <SignupForm />
}