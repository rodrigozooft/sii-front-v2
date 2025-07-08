# CLAUDE.md - AI Assistant Guidelines for SII Frontend v2

This file provides guidance to Claude Code (claude.ai/code) when working with the SII Frontend v2 repository.

## 🏗️ Project Overview

This is the frontend application for the AI Agentic Accounting System for Chilean businesses. It provides a secure, type-safe interface for:
- User authentication and registration
- SII document management (facturas, boletas)
- Bank account integration
- AI-powered reconciliation
- Financial reporting

## 🔐 Security Requirements

### ALWAYS Follow These Security Practices:
1. **Input Validation**: Sanitize ALL user inputs with `sanitize-html`
2. **Type Safety**: Use Zod schemas for runtime validation
3. **Authentication**: Store tokens securely, handle 401/403 errors
4. **Chilean Compliance**: Validate RUTs, format currency properly
5. **OWASP Standards**: Maintain CSP headers, prevent XSS/CSRF

### NEVER:
- Store sensitive data in localStorage (except auth tokens)
- Disable TypeScript strict mode checks
- Add `any` types without explicit justification
- Commit secrets or API keys

## 🌳 Git Workflow

### Branch Strategy:
- `main` → Production (protected)
- `develop` → Development environment
- `feature/*` → New features
- `fix/*` → Bug fixes
- `docs/*` → Documentation

### Commit Convention:
```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

### PR Process:
1. Create feature branch from `develop`
2. Make changes with tests
3. Create PR to `develop`
4. After review, merge to `develop`
5. For production: PR from `develop` to `main`

## 🚀 Development Workflow

### Local Development:
```bash
npm run dev        # Start with Turbopack
npm run test       # Run type-check and lint
npm run build      # Build for production
```

### Before Creating PR:
1. Run `npm run test` - Must pass
2. Test with Chilean data (valid RUTs)
3. Verify API integration works
4. Check security headers in browser

## 🇨🇱 Chilean Localization

### Always Use:
- `formatRut()` for RUT display
- `cleanRut()` before API calls
- `formatCLP()` for currency
- Spanish error messages
- Chilean phone format validation

### Test Data:
- Valid RUT: `12.345.678-9`
- Phone: `+56912345678`
- Currency: CLP (no decimals)

## 📁 Project Structure

```
src/
├── app/           # Next.js pages (App Router)
├── components/    # Reusable UI components
├── lib/           # Core libraries
│   └── api/      # Type-safe API client
├── store/        # Zustand state management
├── utils/        # Utilities (chile.ts)
└── middleware.ts # Security middleware
```

## 🔧 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI**: Ant Design + Tailwind CSS
- **State**: Zustand with Immer
- **Validation**: Zod schemas
- **API Client**: Axios with interceptors
- **Deployment**: Vercel (3 environments)

## 🎯 Current Implementation Status

### ✅ Completed:
- User registration with RUT validation
- Type-safe API client
- Security headers and CSP
- Chilean utilities
- Ant Design theme
- GitHub Actions CI/CD
- Multi-environment deployment

### 🔄 In Progress:
- Firebase authentication
- Login forms
- Dashboard components

### 📋 Planned:
- SII document management
- Bank account connections
- AI reconciliation UI
- Financial reports

## 💡 Best Practices

### Component Development:
1. Use TypeScript interfaces for props
2. Implement error boundaries
3. Add loading states
4. Handle edge cases
5. Write accessible markup

### API Integration:
1. Always use Zod schemas
2. Handle errors gracefully
3. Show user-friendly messages
4. Log errors (not sensitive data)
5. Implement retry logic

### Performance:
1. Use React.memo for expensive components
2. Implement virtualization for long lists
3. Lazy load heavy components
4. Optimize images with Next.js Image
5. Monitor bundle size

## 🚨 Common Issues & Solutions

### RUT Validation:
- Format: `XX.XXX.XXX-X`
- Clean before sending to API
- Validate check digit

### API Errors:
- 401: Redirect to login
- 403: Show permission error
- 500: Generic error message
- Network: Check connection

### Type Errors:
- Run `npm run type-check`
- Check Zod schema matches API
- Verify imports are correct

## 🔍 Debugging Tips

1. Check browser console for CSP violations
2. Verify API is running on localhost:8001
3. Test with real Chilean data
4. Check Network tab for API calls
5. Use React Developer Tools

## 🚀 Deployment Environments

### 1. Local Development
- URL: `http://localhost:3000`
- API: `http://localhost:8001`
- Hot reload with Turbopack

### 2. Development (Vercel)
- Branch: `develop`
- URL: `sii-front-v2-dev.vercel.app`
- Auto-deploy on push to develop

### 3. Production (Vercel)
- Branch: `main`
- URL: Custom domain
- Deploy via PR approval

## 🔐 Security Checklist

### Before Every Commit:
- [ ] No hardcoded secrets or tokens
- [ ] All inputs sanitized with sanitize-html
- [ ] Zod schemas validate all data
- [ ] Error messages don't expose sensitive data
- [ ] Security headers configured properly
- [ ] RUT validation working correctly

### Security Tools:
- CodeQL analysis (GitHub Actions)
- Dependency scanning
- Secret detection (TruffleHog)
- SAST scanning (Semgrep)

## 📞 Getting Help

- API Issues: Check `/api/v1/docs`
- UI Components: Ant Design docs
- Chilean Validation: See `utils/chile.ts`
- Security: Follow OWASP guidelines
- Deployment: Check GitHub Actions logs

## 🎯 Development Guidelines

### Creating New Features:
1. **Plan the feature** - Create todo list with TodoWrite
2. **Create feature branch** from `develop`
3. **Implement with security** - Follow all security practices
4. **Add comprehensive tests** - Unit, integration, Chilean data
5. **Update documentation** - README, comments, API docs
6. **Create PR** - Use template, get reviews
7. **Deploy to dev** - Test in development environment
8. **Merge to main** - After approval for production

### Code Quality Standards:
- TypeScript strict mode (no `any` types)
- ESLint rules must pass
- 100% type coverage with Zod
- Security-first approach
- Chilean localization standards
- WCAG 2.1 accessibility compliance

### API Integration Standards:
- Use type-safe client in `lib/api/`
- Zod schemas for all requests/responses
- Proper error handling and user messages
- Token management via interceptors
- Retry logic for network failures

## 🇨🇱 Chilean Business Requirements

### Tax Compliance (SII):
- RUT validation with proper check digit
- Document types: facturas, boletas, notas de crédito
- Date formats: DD/MM/YYYY
- Tax calculations with proper rounding

### Banking Integration:
- Support for Chilean banks (Itaú, Santander, etc.)
- Multi-currency (CLP, USD, EUR)
- Transaction categorization
- Balance reconciliation

### User Experience:
- Spanish language interface
- Chilean cultural conventions
- Professional business appearance
- Mobile-first responsive design

Remember: This is a financial application handling sensitive Chilean tax and banking data. Security, accuracy, and compliance are paramount!

## 🔄 Workflow Automation

### GitHub Actions:
- **CI Pipeline**: Type-check, lint, test, build
- **Security Scans**: CodeQL, dependency check, secrets scan
- **Deployment**: Auto-deploy to dev/prod environments
- **Release Management**: Automated versioning and releases

### Quality Gates:
- All tests must pass
- Security scans must pass
- Code review required
- Branch protection enforced
- No direct commits to main

This documentation ensures consistent, secure, and high-quality development practices for the AI Agentic Accounting System frontend.