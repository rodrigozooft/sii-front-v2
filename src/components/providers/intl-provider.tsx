'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ReactNode } from 'react'

interface IntlProviderProps {
  children: ReactNode
  locale?: string
  messages: Record<string, unknown>
}

export default function IntlProvider({ 
  children, 
  locale = 'es', 
  messages 
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}