# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏗️ Project Overview

This is the **SII Frontend v2** - a modern, secure, and type-safe React/Next.js application for the Chilean AI Agentic Accounting System. It provides a professional interface for Chilean businesses to manage their tax documents (SII integration), bank accounts, and automated reconciliation workflows.

## 🚀 Development Commands

### Essential Commands
```bash
# Start development server with Turbopack
npm run dev

# Type checking (runs TypeScript compiler)
npm run type-check

# Linting (runs ESLint)
npm run lint

# Full test suite (type-check + lint)
npm run test

# Production build
npm run build

# Start production server
npm run start
```

### Development Workflow
1. Always run `npm run test` before committing (includes type-check + lint)
2. Use `npm run dev` for development (includes hot reload with Turbopack)
3. Test API connection with: `curl http://localhost:8001/api/v1/health`

## 🚀 Deployment & Environment Management

### Three-Environment Setup
This project follows a **three-environment deployment strategy** using Vercel:

1. **Local Development** (`http://localhost:3000`)
   - Run `npm run dev` for local development
   - Hot reload with Turbopack enabled
   - API connects to `http://localhost:8001`

2. **Development Environment** (Vercel)
   - **URL**: `sii-front-v2-dev.vercel.app`
   - **Branch**: `develop`
   - **Auto-deploy**: Triggers on push to `develop` branch
   - **Purpose**: Feature testing and integration validation

3. **Production Environment** (Vercel)
   - **URL**: Custom domain (configured in Vercel)
   - **Branch**: `main`
   - **Deploy Method**: Release-based deployment
   - **Purpose**: Live application for end users

### Vercel Configuration
The following secrets are configured in GitHub Actions:
- `VERCEL_ORG_ID`: Vercel organization/team ID
- `VERCEL_PROJECT_ID`: Project identifier
- `VERCEL_TOKEN`: Deployment authentication token

## 🌿 GitHub Flow Development Workflow

### Branching Strategy (Based on Scott Chacon's GitHub Flow)
We follow the **GitHub Flow** branching strategy with these principles:

1. **Main Branch**: `main` branch is always deployable
2. **Feature Branches**: Create descriptive branches for all work
3. **Pull Requests**: Use PRs for code review and discussion
4. **Deploy from Main**: Production deployments come from `main`

### Branch Naming Conventions
Use these prefixes for all branches:

```bash
# New features
feature/user-authentication
feature/sii-document-upload
feature/ai-reconciliation-dashboard

# Bug fixes
fix/login-validation-error
fix/rut-format-display
fix/api-timeout-handling

# Documentation updates
docs/update-deployment-guide
docs/add-api-integration-examples
docs/security-best-practices

# Refactoring/improvements
refactor/auth-store-optimization
refactor/component-structure
refactor/api-client-cleanup

# Hotfixes (urgent production fixes)
hotfix/critical-security-patch
hotfix/payment-processing-error
```

## 🚫 Important: No AI Attribution in Commits

**CRITICAL RULE**: Never include AI attribution in commit messages or PR descriptions. Keep all commits and PRs clean and professional without any reference to:
- Claude, Anthropic, or any AI assistant
- "Generated with Claude Code" or similar attribution
- "Co-Authored-By: Claude" or AI co-authoring
- Any mention of AI assistance in commit messages, PR titles, or descriptions

All commits should appear as regular developer work without AI attribution.

### Step-by-Step Development Workflow

#### 1. Pre-Implementation Checklist
**CRITICAL: Always follow this checklist before starting any feature:**

```bash
# ✅ Step 1: Review API Documentation
# Use 7Context MCP server to review most updated documentation
# Check the API documentation at http://localhost:8001/api/v1/docs
# Review the API repository at ../sii-api-v2/

# ✅ Step 2: Create Feature Branch
git checkout develop
git pull origin develop
git checkout -b feature/your-descriptive-name

# ✅ Step 3: Verify Local Environment
npm run dev  # Ensure frontend starts correctly
curl http://localhost:8001/health  # Verify API connection
```

#### 2. Development Process

```bash
# Work on your feature
npm run dev  # Development with hot reload

# Regular testing during development
npm run type-check  # TypeScript validation
npm run lint       # ESLint checks
npm run test       # Full test suite

# Commit changes regularly with descriptive messages
git add .
git commit -m "feat: implement user authentication with RUT validation"
```

#### 3. Pre-PR Quality Checks

```bash
# ✅ Required before creating PR
npm run test      # Must pass: type-check + lint
npm run build     # Must build successfully

# ✅ Verify all quality gates
# - TypeScript strict mode compliance
# - ESLint rules compliance  
# - Zod schema validation
# - Chilean data validation (RUT, phone, currency)
# - Security input sanitization
```

#### 4. Pull Request Workflow

```bash
# Push your feature branch
git push origin feature/your-descriptive-name

# Create PR to 'develop' branch (not main)
# PR title: "feat: implement user authentication with RUT validation"
# PR description should include:
# - Feature description
# - Testing steps
# - API changes (if any)
# - Security considerations
```

#### 5. Automated Quality Gates
Every PR triggers these automated checks:

- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Node.js 20 setup
  - Dependencies installation
  - TypeScript type checking
  - ESLint linting
  - Test suite execution
  - Production build verification
  - Bundle size analysis

- **Security Scans** (`.github/workflows/security.yml`):
  - **CodeQL Analysis**: Static code analysis
  - **Dependency Check**: npm audit + Snyk security scan
  - **Secret Scanning**: TruffleHog for exposed secrets
  - **SAST Scan**: Semgrep for security vulnerabilities

#### 6. Deployment Process

**To Development Environment:**
```bash
# After PR approval and merge to 'develop'
# Automatic deployment via .github/workflows/deploy-dev.yml
# Result: Feature available at sii-front-v2-dev.vercel.app
```

**To Production Environment:**
```bash
# Production deployment uses RELEASES
# 1. Create PR from 'develop' to 'main'
# 2. After approval and merge to 'main'
# 3. Automatic deployment via .github/workflows/deploy-prod.yml
# 4. Creates GitHub release with version tag
# 5. Deploys to production Vercel environment
```

## 📚 API Documentation Integration

### 7Context MCP Server Usage
Before implementing ANY feature, use 7Context MCP server to:

1. **Review API Documentation**: Get the most updated API specifications
2. **Check Endpoint Changes**: Verify any modifications to existing endpoints
3. **Understand Data Models**: Review request/response schemas
4. **Security Requirements**: Check authentication and validation requirements

### API Repository Coordination
The API repository is located at `../sii-api-v2/` (same level as this frontend):

- **Local API Docs**: `http://localhost:8001/api/v1/docs`
- **API Repository**: `../sii-api-v2/`
- **Schemas Location**: `../sii-api-v2/app/schemas/`
- **API Endpoints**: `../sii-api-v2/app/api/v1/`

### Integration Best Practices

```typescript
// Always use 7Context before API integration
// 1. Review endpoint documentation
// 2. Check request/response schemas
// 3. Verify authentication requirements
// 4. Update Zod schemas in src/lib/api/schemas.ts
// 5. Update API client in src/lib/api/

// Example: Adding new endpoint
// Step 1: Check API docs via 7Context
// Step 2: Update schemas
export const NewFeatureSchema = z.object({
  // Based on API documentation
})

// Step 3: Update API client
export const newFeatureApi = {
  create: (data: NewFeatureRequest) => 
    apiRequest(
      () => apiClient.post('/new-feature', data),
      NewFeatureSchema
    )
}
```

## 🏛️ Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode enabled)
- **UI Library**: Ant Design + Tailwind CSS
- **State Management**: Zustand with Immer
- **Data Fetching**: TanStack Query (React Query)
- **Validation**: Zod schemas for runtime type safety
- **Forms**: React Hook Form with Zod resolvers
- **Authentication**: Firebase Auth + Custom API
- **Security**: OWASP-compliant headers, CSP, input sanitization

### Key Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (signin, signup, etc.)
│   └── layout.tsx         # Root layout with providers
├── components/
│   ├── auth/              # Authentication components
│   └── providers/         # React context providers
├── lib/
│   ├── api/               # Type-safe API client with Zod validation
│   └── firebase.ts        # Firebase configuration
├── store/                 # Zustand state management
├── utils/                 # Chilean utilities (RUT, phone, currency)
└── middleware.ts          # Security middleware
```

## 🔐 Security-First Architecture

### Security Features
- **Content Security Policy**: Strict CSP headers prevent XSS
- **Input Sanitization**: All user inputs processed with `sanitize-html`
- **Type Safety**: Runtime validation with Zod prevents type errors
- **Chilean Data Validation**: RUT validation, phone format, currency handling
- **Secure Headers**: X-Frame-Options, HSTS, XSS protection

### API Integration Pattern
The application uses a **type-safe API client** with comprehensive error handling:

```typescript
// All API calls use Zod validation
const response = await apiRequest(
  () => apiClient.post('/auth/register', payload),
  AuthResponseSchema
)
```

**Key Files**:
- `src/lib/api/client.ts`: Axios client with interceptors
- `src/lib/api/schemas.ts`: Zod schemas for all API data
- `src/lib/api/auth.ts`: Authentication endpoints

## 🇨🇱 Chilean Localization

### Chilean Data Handling
The application includes comprehensive Chilean business data utilities:

**RUT Validation** (`src/utils/chile.ts`):
- `isValidRut(rut)`: Validates Chilean tax ID with check digit
- `formatRut(rut)`: Formats as "12.345.678-9"
- `cleanRut(rut)`: Cleans for API submission

**Phone & Currency**:
- `isValidChileanPhone()`: Validates +56 format
- `formatCLP()`: Formats currency as "$ 1.234.567"

**Validation Schemas**:
- `RutSchema`: Zod schema for RUT validation
- `ChileanPhoneSchema`: Zod schema for phone validation

## 🔄 State Management Architecture

### Zustand Store Pattern
The application uses Zustand with Immer for predictable state updates:

```typescript
// src/store/auth.ts
export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set) => ({
      // State and actions with type safety
    })),
    { name: 'auth-storage' }
  )
)
```

**Authentication Flow**:
1. User submits form → Form validation (Zod)
2. API call → Response validation (Zod)
3. Token storage → Zustand store update
4. Automatic redirect → Middleware security check

## 📱 Component Architecture

### Form Components
Authentication forms use React Hook Form with Zod validation:

```typescript
// Pattern used across all forms
const form = useForm<FormData>({
  resolver: zodResolver(ValidationSchema),
  defaultValues: { /* */ }
})
```

**Key Components**:
- `SignupForm`: Complete registration with RUT validation
- `SigninForm`: Email/password authentication
- `ForgotPasswordForm`: Password reset workflow
- `EmailVerification`: Email verification process

### Provider Pattern
The application uses a layered provider structure:

```typescript
// src/app/layout.tsx
<IntlProvider locale="es" messages={messages}>
  <QueryProvider>
    <AntdProvider>
      {children}
    </AntdProvider>
  </QueryProvider>
</IntlProvider>
```

## 🛠️ Configuration Files

### TypeScript Configuration
- **Strict Mode**: Enabled with `noImplicitAny`, `strictNullChecks`
- **Path Mapping**: `@/*` maps to `src/*`
- **Additional Checks**: `noUncheckedIndexedAccess` for safer array access

### ESLint Configuration
- **Base Config**: Next.js core web vitals + TypeScript
- **Custom Rules**: Unused variables with underscore prefix exception
- **Dual Config**: Both `eslint.config.mjs` (new) and `.eslintrc.json` (legacy)

### Next.js Configuration
- **Security Headers**: Comprehensive OWASP compliance
- **Turbopack**: Enabled for fast development
- **Image Security**: SVG disabled, CSP for images
- **Environment Variables**: API URL configuration

## 🔧 Development Guidelines

### TypeScript Best Practices
- Use strict type checking (no `any` types)
- Leverage Zod for runtime validation
- Implement proper error boundaries
- Use path imports (`@/` prefix)

### Chilean Business Rules
- Always validate RUTs before API calls
- Use Chilean phone format (+56 prefix)
- Format currency as CLP (no decimals)
- Implement proper date formatting (DD/MM/YYYY)

### Security Requirements
- Sanitize all user inputs with `sanitize-html`
- Use Zod schemas for all data validation
- Implement proper CSP headers
- Handle authentication errors gracefully

### API Integration
- Always use the type-safe API client
- Implement proper error handling
- Use React Query for data fetching
- Handle loading and error states

## 🔄 Environment Variables & Secrets

### Local Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```

### Vercel Environment Configuration

**IMPORTANT**: Configure environment variables directly in Vercel Dashboard, not in vercel.json

**Required Environment Variables:**

**Development Environment:**
- `NEXT_PUBLIC_API_URL`: Development API URL (e.g., `http://localhost:8001`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase development key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- Other Firebase configuration variables

**Production Environment:**
- `NEXT_PUBLIC_API_URL`: Production API URL (e.g., `https://api.yourdomain.com`)
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase production key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- Other Firebase configuration variables

**How to Configure:**
1. Go to Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable for the appropriate environment
4. Never use `@secret_name` syntax in vercel.json - configure directly in dashboard

### GitHub Actions Secrets
Required secrets for deployment automation:
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `VERCEL_TOKEN`: Vercel authentication token
- `SNYK_TOKEN`: Security scanning token
- `SLACK_WEBHOOK`: Deployment notifications (optional)

## 🛡️ Quality Gates & Security

### Required Checks (All Must Pass)

**Before Every Commit:**
1. `npm run type-check` ✅
2. `npm run lint` ✅
3. `npm run build` ✅
4. Manual security review ✅

**Automated PR Checks:**
1. **TypeScript Compilation**: Strict mode, no `any` types
2. **ESLint Validation**: Core web vitals + TypeScript rules
3. **Security Scans**: CodeQL, Snyk, TruffleHog, Semgrep
4. **Build Verification**: Production build must succeed
5. **Bundle Analysis**: Monitor for size increases

**Security Requirements:**
- Input sanitization with `sanitize-html`
- Zod validation for all data
- Chilean data format validation
- CSP headers compliance
- No exposed secrets or credentials

## ⚡ Performance & Monitoring

### Bundle Size Monitoring
Each PR includes bundle size analysis:
```bash
# Automatic bundle size check in CI
du -sh .next/
# Monitor for significant size increases
```

### Development Performance
```bash
# Use Turbopack for fast development
npm run dev  # Already configured in package.json

# Monitor build performance
time npm run build
```

## 🚨 Common Issues & Solutions

### API Connection Issues
- Ensure API server runs on `http://localhost:8001`
- **CORS Configuration**: If you get CORS errors locally, ensure the API has proper CORS headers configured
- For local development, the API should allow requests from `http://localhost:3000`
- Verify environment variables are set
- Test API connectivity: `curl http://localhost:8001/api/v1/auth/register` should return method details

### Common Local Development Issues

**CORS Errors:**
```bash
# The API needs to be configured to allow requests from localhost:3000
# Check that the API server has CORS middleware configured for development
```

**Port Conflicts:**
- Frontend runs on port 3000 (`npm run dev`)
- API should run on port 8001
- Use `npm run dev` to ensure consistent port usage

### Type Errors
- Run `npm run type-check` to identify issues
- Check import paths use `@/` prefix
- Verify Zod schemas match API responses

### RUT Validation Issues
- Use clean format for API calls: `cleanRut(rutInput)`
- Display format for UI: `formatRut(rutInput)`
- Test with valid Chilean RUTs: `12.345.678-9`

### Build Issues
- Check all dependencies are installed
- Verify Firebase environment variables
- Ensure Next.js configuration is valid

## 🌐 API Integration

### Base Configuration
- **API URL**: `http://localhost:8001/api/v1`
- **Authentication**: Bearer token in headers
- **Timeout**: 10 seconds
- **Validation**: All responses validated with Zod

### Supported Endpoints
- `POST /auth/register`: User registration
- `POST /auth/login`: Email/password login
- `POST /auth/logout`: Session termination
- `GET /auth/me`: Current user profile

## 📦 Dependencies

### Core Dependencies
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type safety and developer experience
- **Zod**: Runtime validation and type inference
- **Ant Design**: UI component library
- **Zustand**: Lightweight state management
- **Axios**: HTTP client with interceptors
- **React Hook Form**: Form state management
- **Firebase**: Authentication and analytics
- **next-intl**: Internationalization support

### Security Dependencies
- **sanitize-html**: Input sanitization
- **jose**: JWT handling
- **bcryptjs**: Password hashing utilities

## 🎯 Future Architecture Considerations

### Planned Features
- **Dashboard**: Real-time reconciliation status
- **Document Management**: SII document processing
- **Bank Integration**: Multi-bank account support
- **Reporting**: Financial insights and analytics

### Performance Optimizations
- Implement code splitting for large features
- Use React.memo for expensive components
- Optimize images with Next.js Image component
- Implement virtual scrolling for large lists

### Testing Strategy
- Unit tests for utilities (RUT validation, etc.)
- Integration tests for API client
- Component tests for forms
- E2E tests for authentication flows

## 🎯 Development Success Checklist

### Before Starting Any Feature:
- [ ] Use 7Context MCP to review API documentation
- [ ] Check `http://localhost:8001/api/v1/docs` for latest API specs
- [ ] Create properly named feature branch
- [ ] Verify local environment is working

### During Development:
- [ ] Follow TypeScript strict mode (no `any` types)
- [ ] Use Zod schemas for all data validation
- [ ] Sanitize inputs with `sanitize-html`
- [ ] Validate Chilean data formats (RUT, phone, currency)
- [ ] Run `npm run test` regularly

### Before Creating PR:
- [ ] All tests pass (`npm run test`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Security review completed
- [ ] API integration tested
- [ ] Chilean data validation tested

### After PR Merge:
- [ ] Verify deployment to development environment
- [ ] Test deployed feature functionality
- [ ] Monitor for any deployment issues

## 🏆 Repository Integration

### Multi-Repository Architecture
This frontend is part of the **Open Source Initiatives** ecosystem:

```
open-source-initiatives/
├── sii-front-v2/          # This repository (Frontend)
├── sii-api-v2/            # API Backend
├── sii-api/               # Legacy API (being migrated)
├── sii-robot-and-api/     # Data scraping service
└── sii-front/             # Legacy frontend
```

### Cross-Repository Coordination
When implementing features that span multiple repositories:

1. **API Changes**: Coordinate with `../sii-api-v2/`
2. **Data Flow**: Consider impact on `../sii-robot-and-api/`
3. **Documentation**: Update docs in all affected repositories
4. **Testing**: End-to-end testing across repository boundaries

This architecture provides a solid foundation for a secure, scalable Chilean accounting application with enterprise-grade security practices, comprehensive type safety, and robust deployment workflows.