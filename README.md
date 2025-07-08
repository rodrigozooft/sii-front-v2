# SII Frontend v2 - AI Agentic Accounting System

A modern, secure, and type-safe frontend for the Chilean AI Agentic Accounting System. Built with Next.js 15, TypeScript, and enterprise-grade security features.

## 🏗️ Architecture

This frontend integrates with the existing API at `http://localhost:8001` and provides:

- **Type-Safe API Integration**: Full Zod validation for all API responses
- **Chilean Localization**: RUT validation, CLP formatting, and Spanish interface
- **Enterprise Security**: OWASP-compliant with CSP headers and input sanitization
- **Modern UI/UX**: Ant Design components with custom Chilean theme

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API server running at `http://localhost:8001`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` - you'll be redirected to the signup page.

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/signup/       # Authentication pages
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── auth/              # Authentication components
│   └── providers/         # Context providers
├── lib/
│   └── api/               # Type-safe API client
├── store/                 # Zustand state management
├── utils/                 # Chilean utilities (RUT, phone, etc.)
└── middleware.ts          # Security middleware
```

## 🔒 Security Features

### OWASP Compliance

- **Content Security Policy**: Strict CSP headers prevent XSS attacks
- **Input Sanitization**: All user inputs sanitized with sanitize-html
- **Type Safety**: Runtime validation with Zod prevents type errors
- **Secure Headers**: X-Frame-Options, HSTS, and security headers
- **Authentication**: Secure token management with HTTP-only patterns

### Chilean-Specific Security

- **RUT Validation**: Server-side validation of Chilean tax IDs
- **Phone Validation**: Chilean phone number format validation
- **Currency Safety**: Precise decimal handling for CLP transactions

## 📱 Features

### Current Implementation

✅ **User Registration**
- Type-safe form validation
- Chilean RUT validation
- Password strength requirements
- Input sanitization

✅ **API Integration**
- Axios client with interceptors
- Zod schema validation
- Error handling and retry logic
- Type-safe responses

✅ **Security**
- OWASP security headers
- CSP configuration
- Input sanitization
- TypeScript strict mode

### Future Features (Planned)

🔄 **Authentication**
- Email/password login
- Phone authentication
- Google OAuth
- Multi-factor authentication

🔄 **Dashboard**
- Real-time AI reconciliation
- Bank account overview
- Document management
- Financial insights

🔄 **SII Integration**
- Document download and processing
- Tax compliance monitoring
- Automated categorization

## 🌐 API Integration

The frontend connects to your existing API with full type safety:

```typescript
// Example API usage
import { authApi } from '@/lib/api/auth'

const user = await authApi.register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  first_name: 'Juan',
  last_name: 'Pérez',
  rut: '12.345.678-9'
})
```

### API Endpoints Covered

- `/api/v1/auth/*` - Authentication endpoints
- Type-safe schemas for all request/response data
- Automatic token management
- Error handling and validation

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
```

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
```

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Test API connection
curl http://localhost:8001/api/v1/health
```

## 🇨🇱 Chilean Localization

### RUT Validation

```typescript
import { isValidRut, formatRut } from '@/utils/chile'

isValidRut('12.345.678-9') // true
formatRut('123456789')     // '12.345.678-9'
```

### Currency Formatting

```typescript
import { formatCLP } from '@/utils/chile'

formatCLP(1234567) // '$ 1.234.567'
```

## 📋 Contributing

1. Follow TypeScript strict mode requirements
2. Use Zod schemas for all data validation
3. Sanitize user inputs with sanitize-html
4. Test with real Chilean data (RUT, phone numbers)
5. Maintain OWASP security standards

## 🔍 Troubleshooting

### Common Issues

**API Connection Errors**
- Ensure API server is running on `http://localhost:8001`
- Check CORS configuration
- Verify environment variables

**Type Errors**
- Run `npm run type-check`
- Ensure all imports use correct paths
- Check Zod schema matches API responses

**RUT Validation Issues**
- Use format `12.345.678-9` or `12345678-9`
- Check digit calculation follows Chilean algorithm
- Test with real Chilean RUTs

## 📞 Support

For issues related to:
- **Frontend**: Check this README and GitHub issues
- **API Integration**: Refer to API documentation at `/api/v1/docs`
- **Chilean Features**: Test with valid Chilean RUT/phone numbers

---

Built with ❤️ for Chilean businesses using modern web technologies and enterprise-grade security practices.