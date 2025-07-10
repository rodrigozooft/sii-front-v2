import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Create the internationalization middleware
const intlMiddleware = createMiddleware(routing)

export function middleware(request: NextRequest) {
  // Handle internationalization first
  const intlResponse = intlMiddleware(request)
  
  // If intlMiddleware returns a response (redirect/rewrite), use it
  if (intlResponse) {
    // Add security headers to the intl response
    addSecurityHeaders(intlResponse)
    return intlResponse
  }

  // Create response with security headers for non-intl requests
  const response = NextResponse.next()
  addSecurityHeaders(response)
  return response
}

function addSecurityHeaders(response: NextResponse) {
  // Security Headers for OWASP compliance
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy for enhanced security
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' http://localhost:8001 https://*.googleapis.com https://*.firebaseapp.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'"
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)

  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}