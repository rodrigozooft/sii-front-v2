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
    '/dashboard': {
      es: '/panel',
      en: '/dashboard'
    }
  }
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
export type Locale = (typeof routing.locales)[number]