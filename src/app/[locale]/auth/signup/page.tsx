import React from 'react'
import SignupForm from '@/components/auth/signup-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registro - Sistema de Contabilidad SII',
  description: 'Crea tu cuenta en el Sistema de Contabilidad Inteligente AI para Chile',
  keywords: ['registro', 'crear cuenta', 'sii', 'chile', 'contabilidad', 'rut'],
  robots: 'noindex, nofollow', // Don't index auth pages
}

export default function SignupPage(): React.JSX.Element {
  return <SignupForm />
}