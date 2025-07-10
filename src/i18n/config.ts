import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // Spanish as primary language for Chilean users
  locales: ['es', 'en'],
  defaultLocale: 'es',
  
  // Paths for different locales
  pathnames: {
    '/': '/',
    '/auth/signup': {
      es: '/auth/registro',
      en: '/auth/signup'
    },
    '/auth/signin': {
      es: '/auth/iniciar-sesion',
      en: '/auth/signin'
    },
    '/auth/email-confirmation': {
      es: '/auth/confirmar-email',
      en: '/auth/email-confirmation'
    },
    '/dashboard': {
      es: '/panel',
      en: '/dashboard'
    },
    '/companies/create': {
      es: '/empresas/crear',
      en: '/companies/create'
    }
  }
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
export type Locale = (typeof routing.locales)[number]