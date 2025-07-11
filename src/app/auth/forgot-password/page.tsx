import React from 'react'
import ForgotPasswordForm from '@/components/auth/forgot-password-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forgot Password - SII Accounting System',
  description: 'Reset your password for the AI Agentic Accounting System for Chile',
  robots: 'noindex, nofollow', // Don't index auth pages
}

export default function ForgotPasswordPage(): React.JSX.Element {
  return <ForgotPasswordForm />
}