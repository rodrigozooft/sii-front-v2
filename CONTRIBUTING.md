# Contributing to SII Frontend v2

Thank you for your interest in contributing to the AI Agentic Accounting System for Chile! This document provides guidelines and information for contributors.

## 🌍 Project Mission

This project aims to create a secure, modern, and user-friendly frontend for Chilean businesses to manage their accounting, tax compliance (SII), and bank integrations through AI-powered automation.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm
- Git
- API server running at `http://localhost:8001`

### Local Development Setup
```bash
# Clone the repository
git clone git@github.com:rodrigozooft/sii-front-v2.git
cd sii-front-v2

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## 📋 Development Workflow

### Branch Strategy
We use **GitHub Flow** with the following branches:

- `main` → Production environment (protected)
- `develop` → Development environment
- `feature/*` → New features
- `fix/*` → Bug fixes
- `docs/*` → Documentation updates
- `refactor/*` → Code refactoring
- `test/*` → Test additions

### Creating a Feature

1. **Create a feature branch from `develop`:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes following our guidelines**

3. **Test your changes:**
   ```bash
   npm run test        # Type-check + lint
   npm run build       # Ensure it builds
   ```

4. **Commit with conventional commits:**
   ```bash
   git add .
   git commit -m "feat: add user profile management"
   ```

5. **Push and create PR:**
   ```bash
   git push -u origin feature/your-feature-name
   # Create PR to `develop` branch
   ```

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style/formatting (no logic changes)
- `refactor:` - Code refactoring
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks

### Examples
```bash
feat(auth): add Chilean RUT validation to signup form
fix(api): handle network timeout errors gracefully
docs(readme): update deployment instructions
style(components): format signup form with prettier
refactor(utils): extract currency formatting logic
test(validation): add RUT validation test cases
chore(deps): update dependencies to latest versions
```

## 🔒 Security Guidelines

### ALWAYS Follow These Practices:

1. **Input Validation & Sanitization**
   ```typescript
   // Always sanitize user inputs
   import sanitizeHtml from 'sanitize-html'
   
   const cleanInput = sanitizeHtml(userInput, { 
     allowedTags: [], 
     allowedAttributes: {} 
   })
   ```

2. **Type Safety**
   ```typescript
   // Use Zod schemas for validation
   const UserSchema = z.object({
     email: z.string().email(),
     rut: RutSchema
   })
   ```

3. **Chilean Compliance**
   ```typescript
   // Always validate RUTs properly
   import { isValidRut, formatRut } from '@/utils/chile'
   
   if (!isValidRut(rut)) {
     throw new Error('Invalid Chilean RUT')
   }
   ```

### NEVER:
- Store sensitive data in localStorage (except auth tokens)
- Disable TypeScript strict mode
- Use `any` types without justification
- Commit API keys or secrets
- Ignore ESLint security warnings

## 🇨🇱 Chilean Localization Standards

### RUT (Rol Único Tributario)
```typescript
// Format: XX.XXX.XXX-X
const validRuts = [
  '12.345.678-9',
  '1.234.567-8',
  '23.456.789-K'
]

// Always use utility functions
import { isValidRut, formatRut, cleanRut } from '@/utils/chile'
```

### Phone Numbers
```typescript
// Format: +56 9 XXXX XXXX
const validPhones = [
  '+56912345678',
  '+56987654321'
]
```

### Currency (CLP)
```typescript
// No decimal places for CLP
import { formatCLP } from '@/utils/chile'
formatCLP(1234567) // "$ 1.234.567"
```

### Dates
```typescript
// Chilean format: DD/MM/YYYY
const chileanDate = new Date().toLocaleDateString('es-CL')
```

## 🧪 Testing Requirements

### Before Submitting PR:
```bash
# All checks must pass
npm run type-check     # TypeScript compilation
npm run lint          # ESLint rules
npm run test          # Combined checks
npm run build         # Production build
```

### Test Categories:
1. **Unit Tests** - Individual component/function testing
2. **Integration Tests** - API integration testing
3. **E2E Tests** - Complete user workflow testing
4. **Security Tests** - Input validation and XSS prevention

### Chilean-Specific Testing:
```typescript
// Test with real Chilean data
const testCases = [
  { rut: '12.345.678-9', valid: true },
  { rut: '12.345.678-0', valid: false },
  { phone: '+56912345678', valid: true },
  { currency: 1234567, formatted: '$ 1.234.567' }
]
```

## 📁 Code Organization

### File Structure
```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
│   ├── auth/        # Authentication components
│   ├── layout/      # Layout components
│   └── ui/          # Basic UI components
├── lib/             # Core libraries
│   └── api/         # Type-safe API client
├── store/           # State management (Zustand)
├── utils/           # Utility functions
│   └── chile.ts     # Chilean-specific utilities
└── middleware.ts    # Security middleware
```

### Component Guidelines:
```typescript
// Use TypeScript interfaces
interface Props {
  rut: string
  onValidation: (isValid: boolean) => void
}

// Prefer function components
export default function RutValidator({ rut, onValidation }: Props): React.JSX.Element {
  // Implementation
}
```

## 🎨 UI/UX Guidelines

### Design Principles:
1. **Accessibility First** - WCAG 2.1 compliance
2. **Mobile Responsive** - Chilean mobile usage is high
3. **Professional** - Suitable for business environments
4. **Localized** - Spanish language, Chilean conventions

### Ant Design Usage:
```typescript
// Use Chilean-themed components
import { ConfigProvider } from 'antd'
import esES from 'antd/locale/es_ES'

// Follow Chilean business color schemes
const theme = {
  token: {
    colorPrimary: '#1890ff', // Professional blue
    colorSuccess: '#52c41a'  // Financial green
  }
}
```

## 🚀 Pull Request Process

### PR Requirements:
1. **Target `develop` branch** (not `main`)
2. **Fill out PR template completely**
3. **Pass all CI checks**
4. **Include tests for new features**
5. **Update documentation if needed**

### Review Process:
1. **Automated Checks** - CI/CD, security scans
2. **Code Review** - At least 1 approval required
3. **Manual Testing** - Verify functionality works
4. **Merge to `develop`** - After approval

### Production Deployment:
- Only `develop` → `main` PRs deploy to production
- Requires additional approval
- Automated deployment to Vercel

## 🔍 Common Issues & Solutions

### Type Errors:
```bash
# Fix TypeScript issues
npm run type-check
# Check specific file
npx tsc --noEmit src/path/to/file.ts
```

### Linting Issues:
```bash
# Auto-fix many issues
npm run lint -- --fix
```

### RUT Validation:
```typescript
// Common issue: format vs validation
const rut = '123456789' // Invalid format
const formatted = formatRut(rut) // '12.345.678-9'
const isValid = isValidRut(formatted) // true/false
```

### API Integration:
```typescript
// Always use Zod schemas
const response = await apiRequest(
  () => apiClient.post('/endpoint', data),
  ResponseSchema // Must match API response
)
```

## 📞 Getting Help

- **Technical Issues**: Create GitHub issue
- **API Questions**: Check `/api/v1/docs`
- **Chilean Standards**: See `utils/chile.ts`
- **Security Concerns**: Email maintainers privately

## 🏆 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Invited to collaboration discussions

Thank you for contributing to Chile's AI-powered accounting future! 🇨🇱