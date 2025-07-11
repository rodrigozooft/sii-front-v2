import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  // Default to Spanish for Chilean system
  const locale = 'es'

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})