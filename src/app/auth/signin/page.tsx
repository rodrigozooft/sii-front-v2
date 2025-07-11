import React from 'react'
import SigninForm from '@/components/auth/signin-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - SII Accounting System',
  description: 'Access your AI Agentic Accounting System for Chile account',
  keywords: ['signin', 'login', 'access', 'sii', 'chile', 'accounting'],
  robots: 'noindex, nofollow', // Don't index auth pages
}

export default function SigninPage(): React.JSX.Element {
  return <SigninForm />
}