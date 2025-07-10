import React from 'react'
import EmailConfirmation from '@/components/auth/email-confirmation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirmar Email - Sistema de Contabilidad SII',
  description: 'Confirma tu dirección de correo electrónico para activar tu cuenta',
  keywords: ['confirmación', 'email', 'verificación', 'cuenta', 'sii'],
  robots: 'noindex, nofollow', // Don't index auth pages
}

export default function EmailConfirmationPage(): React.JSX.Element {
  return <EmailConfirmation />
}