import React from 'react'
import SigninForm from '@/components/auth/signin-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Sistema de Contabilidad SII',
  description: 'Accede a tu cuenta del Sistema de Contabilidad Inteligente AI para Chile',
  keywords: ['iniciar sesión', 'login', 'acceso', 'sii', 'chile', 'contabilidad'],
  robots: 'noindex, nofollow', // Don't index auth pages
}

export default function SigninPage(): React.JSX.Element {
  return <SigninForm />
}