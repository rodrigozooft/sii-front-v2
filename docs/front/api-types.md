# TypeScript Types Reference

This file contains all TypeScript interfaces and types needed for implementing authentication with the SII API v2 backend.

## 📋 Authentication Request Types

### RegisterRequest
Used for user registration via `POST /api/v1/auth/register`

```typescript
interface RegisterRequest {
  email: string;           // Valid email address
  password: string;        // Min 8 chars, must contain uppercase, lowercase, digit
  name: string;           // Min 2 chars, max 255 chars
  phone?: string;         // Optional, max 20 chars, international format (+56912345678)
  rut?: string;           // Optional, Chilean tax ID format (12345678-9)
}
```

### LoginRequest
Used for email/password login via `POST /api/v1/auth/login/email`

```typescript
interface LoginRequest {
  email?: string;         // Email for login (optional if id_token provided)
  password?: string;      // Password for login (optional if id_token provided)
  id_token?: string;      // Firebase ID token (if already authenticated)
}
```

### GoogleLoginRequest
Used for Google OAuth login via `POST /api/v1/auth/login/google`

```typescript
interface GoogleLoginRequest {
  id_token: string;       // Google ID token from Firebase
}
```

### PhoneLoginRequest
Used for phone authentication via `POST /api/v1/auth/login/phone`

```typescript
interface PhoneLoginRequest {
  phone_number: string;           // Phone number in international format
  verification_code?: string;     // SMS verification code
}
```

### PhoneSendCodeRequest
Used to send SMS verification code via `POST /api/v1/auth/phone/send-code`

```typescript
interface PhoneSendCodeRequest {
  phone_number: string;   // Phone number in international format (+56912345678)
}
```

### PhoneVerifyCodeRequest
Used to verify SMS code via `POST /api/v1/auth/phone/verify-code`

```typescript
interface PhoneVerifyCodeRequest {
  phone_number: string;           // Phone number in international format
  verification_code: string;      // 6-digit SMS verification code
}
```

### ForgotPasswordRequest
Used for password reset via `POST /api/v1/auth/forgot-password`

```typescript
interface ForgotPasswordRequest {
  email: string;          // Email address for password reset
}
```

### EmailVerificationRequest
Used for email verification via `POST /api/v1/auth/verify-email`

```typescript
interface EmailVerificationRequest {
  verification_code: string;      // Email verification code
}
```

### LogoutRequest
Used for logout via `POST /api/v1/auth/logout`

```typescript
interface LogoutRequest {
  token: string;          // Access token to invalidate
}
```

## 📤 Authentication Response Types

### TokenResponse
Contains authentication token information

```typescript
interface TokenResponse {
  access_token: string;   // JWT access token for API requests
  token_type: string;     // Always "bearer"
  expires_in: number;     // Token expiration time in seconds
  refresh_token?: string; // Optional refresh token (not currently used)
}
```

### LoginResponse
Main authentication response format used by most auth endpoints

```typescript
interface LoginResponse {
  message: string;                    // Human-readable status message
  user?: UserResponse;                // User information (if successful)
  token?: TokenResponse;              // Token information (if successful)
  instructions?: Record<string, string>; // Additional instructions for client
}
```

## 👤 User Data Types

### UserResponse
Basic user information returned in authentication responses

```typescript
interface UserResponse {
  id: string;             // Unique user ID (UUID)
  firebase_uid: string;   // Firebase user ID
  email: string;          // User's email address
  name: string;           // User's full name
  phone?: string;         // Optional phone number
  rut?: string;           // Optional Chilean tax ID
  avatar_url?: string;    // Optional profile picture URL
  is_active: boolean;     // Whether user account is active
  is_verified: boolean;   // Whether email is verified
  created_at: string;     // ISO timestamp of account creation
  updated_at: string;     // ISO timestamp of last update
}
```

### UserProfile
Extended user information from `GET /api/v1/auth/profile`

```typescript
interface UserProfile extends UserResponse {
  company_count: number;          // Number of companies user belongs to
  current_company_id?: string;    // Currently active company ID
  last_login?: string;            // ISO timestamp of last login
}
```

### UserUpdate
Used for updating user profile via `PUT /api/v1/auth/profile`

```typescript
interface UserUpdate {
  name?: string;          // Updated name (min 2, max 255 chars)
  phone?: string;         // Updated phone number (max 20 chars)
  rut?: string;           // Updated Chilean tax ID
  avatar_url?: string;    // Updated profile picture URL
}
```

## 🔐 Multi-Factor Authentication Types

### MFAEnableRequest
Used to enable MFA via `POST /api/v1/auth/mfa/enable`

```typescript
interface MFAEnableRequest {
  phone_number: string;   // Phone number for SMS MFA
}
```

### MFAVerifyRequest
Used to verify MFA code via `POST /api/v1/auth/mfa/verify`

```typescript
interface MFAVerifyRequest {
  code: string;           // 6-digit MFA code
}
```

### MFAResponse
Response from MFA enable endpoint

```typescript
interface MFAResponse {
  enabled: boolean;               // Whether MFA is now enabled
  backup_codes?: string[];        // One-time backup codes
}
```

## ❌ Error Response Types

### APIError
Standard error response format from the API

```typescript
interface APIError {
  detail: string;         // Error message
  type?: string;          // Error type (optional)
  code?: string;          // Error code (optional)
}
```

### ValidationError
Validation error with field-specific details

```typescript
interface ValidationError {
  detail: Array<{
    loc: (string | number)[];     // Field location in request
    msg: string;                  // Error message
    type: string;                 // Error type
  }>;
}
```

## 🔄 Authentication State Types

### AuthState
Client-side authentication state management

```typescript
interface AuthState {
  firebaseUser: FirebaseUser | null;     // Firebase user object
  user: UserResponse | null;             // API user data
  apiToken: string | null;               // API access token
  loading: boolean;                      // Loading state
  error: string | null;                  // Error message
}
```

### FirebaseUser
Firebase user object (from Firebase SDK)

```typescript
// This comes from Firebase SDK
import { User as FirebaseUser } from 'firebase/auth';

// Key properties you'll use:
interface FirebaseUserSubset {
  uid: string;                    // Firebase user ID
  email: string | null;          // User's email
  emailVerified: boolean;        // Email verification status
  displayName: string | null;    // User's display name
  photoURL: string | null;       // Profile picture URL
  phoneNumber: string | null;    // Phone number
  getIdToken(): Promise<string>; // Get Firebase ID token
}
```

## 🛠️ Utility Types

### AuthContextType
Context type for React authentication provider

```typescript
interface AuthContextType extends AuthState {
  signUp: (userData: RegisterRequest) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}
```

### FormValidationErrors
Generic form validation error type

```typescript
interface FormValidationErrors<T = Record<string, unknown>> {
  [K in keyof T]?: string;
}

// Usage examples:
type SignUpErrors = FormValidationErrors<RegisterRequest & { confirmPassword: string }>;
type SignInErrors = FormValidationErrors<{ email: string; password: string }>;
```

### APIRequestConfig
Configuration for API requests

```typescript
interface APIRequestConfig extends RequestInit {
  requireAuth?: boolean;          // Whether to include auth token
  skipAuthRedirect?: boolean;     // Skip redirect on 401 errors
}
```

## 📱 Phone Authentication Types

### PhoneAuthState
State for phone number authentication flow

```typescript
interface PhoneAuthState {
  step: 'phone' | 'verification' | 'complete';
  phoneNumber: string;
  verificationId?: string;
  loading: boolean;
  error: string | null;
  resendCooldown: number;
}
```

## 🌍 Chilean-Specific Types

### ChileanRUT
Chilean tax ID validation

```typescript
interface ChileanRUT {
  number: string;         // RUT number without check digit
  checkDigit: string;     // Check digit (0-9 or K)
  formatted: string;      // Formatted RUT (12.345.678-9)
  isValid: boolean;       // Whether RUT is valid
}
```

## 🔍 Search and Filter Types

### UserSearchResult
Used for searching users (e.g., for company invitations)

```typescript
interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  is_member: boolean;     // Whether user is already a member
}
```

## 📊 Analytics Types

### AuthEvent
Authentication event for analytics tracking

```typescript
interface AuthEvent {
  type: 'sign_up' | 'sign_in' | 'sign_out' | 'password_reset' | 'email_verification';
  provider: 'email' | 'google' | 'phone';
  timestamp: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
}
```

## 💾 Storage Types

### StoredAuthData
Data stored in localStorage/sessionStorage

```typescript
interface StoredAuthData {
  apiToken: string;
  user: UserResponse;
  expiresAt: string;      // ISO timestamp
  refreshToken?: string;
}
```

## 🔄 API Response Wrappers

### PaginatedResponse
For paginated API responses

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}
```

### APIResponse
Generic API response wrapper

```typescript
interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: Record<string, unknown>;
}
```

## 🎯 Usage Examples

### Type Guards
Helper functions to check types at runtime

```typescript
// Check if response is an error
function isAPIError(response: unknown): response is APIError {
  return typeof response === 'object' && 
         response !== null && 
         'detail' in response;
}

// Check if user is verified
function isVerifiedUser(user: UserResponse): boolean {
  return user.is_verified && user.is_active;
}

// Check if login response is successful
function isSuccessfulLogin(response: LoginResponse): response is LoginResponse & {
  user: UserResponse;
  token: TokenResponse;
} {
  return !!(response.user && response.token);
}
```

### Type Assertions
Safe type casting helpers

```typescript
// Cast stored data safely
function getStoredAuthData(): StoredAuthData | null {
  try {
    const stored = localStorage.getItem('auth_data');
    if (!stored) return null;
    
    const data = JSON.parse(stored) as StoredAuthData;
    
    // Validate required fields
    if (!data.apiToken || !data.user || !data.expiresAt) {
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}
```

## 📝 Usage Notes

1. **Null Safety**: Many fields are optional (`?`) or nullable (`| null`). Always check before using.

2. **Validation**: The API performs server-side validation. Use the same rules in your client-side validation.

3. **Dates**: All timestamps are ISO strings. Convert to Date objects when needed:
   ```typescript
   const createdDate = new Date(user.created_at);
   ```

4. **Tokens**: API tokens are JWTs. Store securely and include in Authorization headers:
   ```typescript
   const headers = {
     'Authorization': `Bearer ${apiToken}`,
     'Content-Type': 'application/json'
   };
   ```

5. **Error Handling**: Always check for errors in API responses and handle them appropriately.

6. **Firebase Integration**: Use Firebase SDK for client-side authentication, then exchange tokens with the API.

This type reference provides type safety and autocomplete support when implementing authentication in your frontend application.