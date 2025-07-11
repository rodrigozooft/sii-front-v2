# React Component Examples

This file contains ready-to-use React components for implementing authentication with the SII API v2 backend. These components include proper error handling, validation, and Firebase integration.

## 🔧 Setup Components

### 1. Firebase Configuration

Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Connect to Firebase Auth emulator in development
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export default app;
```

### 2. Environment Variables

Create `.env.local`:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=finsnap-5c12a.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=finsnap-5c12a
REACT_APP_FIREBASE_STORAGE_BUCKET=finsnap-5c12a.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8001/api/v1

# Development
REACT_APP_USE_FIREBASE_EMULATOR=false
```

## 🎣 Custom Hooks

### 1. useAuthForm Hook

Create `src/hooks/useAuthForm.ts`:

```typescript
import { useState } from 'react';

interface UseAuthFormProps<T> {
  initialValues: T;
  validate: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void>;
}

export function useAuthForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseAuthFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearErrors = () => {
    setErrors({});
    setSubmitError(null);
  };

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    clearErrors,
    setValues
  };
}
```

### 2. useAsyncOperation Hook

Create `src/hooks/useAsyncOperation.ts`:

```typescript
import { useState, useCallback } from 'react';

interface UseAsyncOperationReturn<T> {
  execute: (...args: any[]) => Promise<T>;
  loading: boolean;
  error: string | null;
  data: T | null;
  clearError: () => void;
  reset: () => void;
}

export function useAsyncOperation<T>(
  operation: (...args: any[]) => Promise<T>
): UseAsyncOperationReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [operation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { execute, loading, error, data, clearError, reset };
}
```

## 🔒 Enhanced Authentication Context

Create `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService } from '../services/authService';
import { UserResponse, RegisterRequest, TokenResponse } from '../types/auth';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: UserResponse | null;
  apiToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (userData: RegisterRequest) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserResponse>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Token storage utilities
const TOKEN_KEY = 'sii_api_token';
const USER_KEY = 'sii_user_data';
const TOKEN_EXPIRY_KEY = 'sii_token_expiry';

function storeAuthData(token: TokenResponse, user: UserResponse) {
  const expiryTime = Date.now() + (token.expires_in * 1000);
  
  localStorage.setItem(TOKEN_KEY, token.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

function getStoredAuthData(): { token: string; user: UserResponse } | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !userJson || !expiry) return null;

    // Check if token is expired
    if (Date.now() > parseInt(expiry, 10)) {
      clearStoredAuthData();
      return null;
    }

    const user = JSON.parse(userJson) as UserResponse;
    return { token, user };
  } catch {
    clearStoredAuthData();
    return null;
  }
}

function clearStoredAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    apiToken: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  // Update authentication state
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      return {
        ...newState,
        isAuthenticated: !!(newState.user && newState.apiToken),
      };
    });
  }, []);

  // Sign up function
  const signUp = useCallback(async (userData: RegisterRequest) => {
    updateAuthState({ loading: true, error: null });
    
    try {
      const response = await authService.register(userData);
      
      if (response.token && response.user) {
        storeAuthData(response.token, response.user);
        updateAuthState({
          user: response.user,
          apiToken: response.token.access_token,
          loading: false,
        });
      } else {
        throw new Error('Registration succeeded but no token received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      updateAuthState({ error: errorMessage, loading: false });
      throw error;
    }
  }, [updateAuthState]);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string) => {
    updateAuthState({ loading: true, error: null });
    
    try {
      const response = await authService.signIn(email, password);
      
      if (response.token && response.user) {
        storeAuthData(response.token, response.user);
        updateAuthState({
          user: response.user,
          apiToken: response.token.access_token,
          loading: false,
        });
      } else {
        throw new Error('Sign in succeeded but no token received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      updateAuthState({ error: errorMessage, loading: false });
      throw error;
    }
  }, [updateAuthState]);

  // Sign out function
  const signOut = useCallback(async () => {
    updateAuthState({ loading: true });
    
    try {
      await authService.signOut();
      clearStoredAuthData();
      updateAuthState({
        firebaseUser: null,
        user: null,
        apiToken: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      updateAuthState({ error: errorMessage, loading: false });
    }
  }, [updateAuthState]);

  // Clear error function
  const clearError = useCallback(() => {
    updateAuthState({ error: null });
  }, [updateAuthState]);

  // Refresh profile function
  const refreshProfile = useCallback(async () => {
    if (!state.apiToken) return;

    try {
      const profile = await authService.getProfile(state.apiToken);
      updateAuthState({ user: profile });
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, [state.apiToken, updateAuthState]);

  // Update profile function (optimistic update)
  const updateProfile = useCallback((updates: Partial<UserResponse>) => {
    setState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      updateAuthState({ firebaseUser });
      
      // If Firebase user signs out, clear everything
      if (!firebaseUser) {
        clearStoredAuthData();
        updateAuthState({
          user: null,
          apiToken: null,
          loading: false,
        });
      }
    });

    // Load stored auth data
    const storedData = getStoredAuthData();
    if (storedData) {
      updateAuthState({
        user: storedData.user,
        apiToken: storedData.token,
        loading: false,
      });
    } else {
      updateAuthState({ loading: false });
    }

    return unsubscribe;
  }, [updateAuthState]);

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    clearError,
    refreshProfile,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 📝 Form Components

### 1. Input Field Component

Create `src/components/common/InputField.tsx`:

```typescript
import React, { forwardRef } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, required, className = '', ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';
    const inputClasses = `${baseClasses} ${errorClasses} ${className}`;

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <input
          ref={ref}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          {...props}
        />
        
        {error && (
          <p 
            id={`${props.id || props.name}-error`}
            className="text-red-500 text-sm"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-gray-500 text-sm">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
```

### 2. Submit Button Component

Create `src/components/common/SubmitButton.tsx`:

```typescript
import React from 'react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary';
}

export function SubmitButton({ 
  children, 
  loading = false, 
  loadingText = 'Loading...', 
  variant = 'primary',
  className = '',
  disabled,
  ...props 
}: SubmitButtonProps) {
  const baseClasses = 'w-full py-2 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100'
  };

  const isDisabled = disabled || loading;
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={buttonClasses}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
```

### 3. Error Alert Component

Create `src/components/common/ErrorAlert.tsx`:

```typescript
import React from 'react';

interface ErrorAlertProps {
  error: string | null;
  onDismiss?: () => void;
  title?: string;
}

export function ErrorAlert({ error, onDismiss, title = 'Error' }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 🔐 Enhanced Authentication Forms

### 1. Advanced Sign Up Form

Create `src/components/auth/SignUpForm.tsx`:

```typescript
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { InputField } from '../common/InputField';
import { SubmitButton } from '../common/SubmitButton';
import { ErrorAlert } from '../common/ErrorAlert';
import { RegisterRequest } from '../../types/auth';

interface SignUpFormData extends RegisterRequest {
  confirmPassword: string;
  acceptTerms: boolean;
}

const initialValues: SignUpFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  rut: '',
  acceptTerms: false,
};

// Validation function
function validateSignUpForm(values: SignUpFormData) {
  const errors: Partial<Record<keyof SignUpFormData, string>> = {};

  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Name validation
  if (!values.name) {
    errors.name = 'Name is required';
  } else if (values.name.length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else {
    if (values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])/.test(values.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(values.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(values.password)) {
      errors.password = 'Password must contain at least one digit';
    }
  }

  // Confirm password validation
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Phone validation (optional)
  if (values.phone && !/^\+?[\d\s-()]+$/.test(values.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // Terms validation
  if (!values.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions';
  }

  return errors;
}

export function SignUpForm() {
  const { signUp } = useAuth();

  const {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    clearErrors
  } = useAuthForm({
    initialValues,
    validate: validateSignUpForm,
    onSubmit: async (formData) => {
      const { confirmPassword, acceptTerms, ...registerData } = formData;
      await signUp(registerData);
    }
  });

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
        <p className="text-gray-600 mt-2">Join us to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email"
          type="email"
          name="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
          placeholder="Enter your email"
          autoComplete="email"
        />

        <InputField
          label="Full Name"
          type="text"
          name="name"
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          required
          placeholder="Enter your full name"
          autoComplete="name"
        />

        <InputField
          label="Password"
          type="password"
          name="password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          required
          placeholder="Create a password"
          autoComplete="new-password"
          helperText="Must be at least 8 characters with uppercase, lowercase, and number"
        />

        <InputField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          required
          placeholder="Confirm your password"
          autoComplete="new-password"
        />

        <InputField
          label="Phone Number"
          type="tel"
          name="phone"
          value={values.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          placeholder="+56912345678"
          autoComplete="tel"
          helperText="Optional - Include country code"
        />

        <InputField
          label="RUT (Chilean Tax ID)"
          type="text"
          name="rut"
          value={values.rut}
          onChange={(e) => handleChange('rut', e.target.value)}
          placeholder="12345678-9"
          helperText="Optional - Chilean tax identification number"
        />

        <div className="space-y-2">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={values.acceptTerms}
              onChange={(e) => handleChange('acceptTerms', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I accept the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500">
                Terms and Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
          )}
        </div>

        <ErrorAlert 
          error={submitError} 
          onDismiss={clearErrors}
          title="Registration Failed"
        />

        <SubmitButton 
          loading={isSubmitting}
          loadingText="Creating Account..."
        >
          Create Account
        </SubmitButton>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/signin" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
```

### 2. Enhanced Sign In Form

Create `src/components/auth/SignInForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthForm } from '../../hooks/useAuthForm';
import { InputField } from '../common/InputField';
import { SubmitButton } from '../common/SubmitButton';
import { ErrorAlert } from '../common/ErrorAlert';

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const initialValues: SignInFormData = {
  email: '',
  password: '',
  rememberMe: false,
};

function validateSignInForm(values: SignInFormData) {
  const errors: Partial<Record<keyof SignInFormData, string>> = {};

  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return errors;
}

export function SignInForm() {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    clearErrors
  } = useAuthForm({
    initialValues,
    validate: validateSignInForm,
    onSubmit: async (formData) => {
      await signIn(formData.email, formData.password);
    }
  });

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <InputField
          label="Email"
          type="email"
          name="email"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          required
          placeholder="Enter your email"
          autoComplete="email"
        />

        <div className="relative">
          <InputField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            required
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L18 18" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={values.rememberMe}
              onChange={(e) => handleChange('rememberMe', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>

          <a 
            href="/forgot-password" 
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Forgot password?
          </a>
        </div>

        <ErrorAlert 
          error={submitError} 
          onDismiss={clearErrors}
          title="Sign In Failed"
        />

        <SubmitButton 
          loading={isSubmitting}
          loadingText="Signing In..."
        >
          Sign In
        </SubmitButton>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

## 🛡️ Protected Route Component

Create `src/components/auth/ProtectedRoute.tsx`:

```typescript
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireVerification = false,
  fallback,
  loadingComponent
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading state
  if (loading) {
    return loadingComponent || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-900">Authentication Required</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to access this page.
          </p>
          <div className="mt-6 space-y-2">
            <a
              href="/signin"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check email verification if required
  if (requireVerification && !user.is_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-gray-900">Email Verification Required</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please verify your email address to access this page.
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/verify-email'}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Verify Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

## 👤 User Profile Component

Create `src/components/auth/UserProfile.tsx`:

```typescript
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { InputField } from '../common/InputField';
import { SubmitButton } from '../common/SubmitButton';
import { ErrorAlert } from '../common/ErrorAlert';
import { authService } from '../../services/authService';

export function UserProfile() {
  const { user, updateProfile, apiToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    rut: user?.rut || '',
  });

  const { execute: updateUserProfile, loading, error, clearError } = useAsyncOperation(
    async (updates: typeof formData) => {
      if (!apiToken) throw new Error('No authentication token');
      return authService.updateProfile(apiToken, updates);
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedUser = await updateUserProfile(formData);
      updateProfile(updatedUser);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      rut: user?.rut || '',
    });
    setIsEditing(false);
    clearError();
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <InputField
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+56912345678"
            />

            <InputField
              label="RUT (Chilean Tax ID)"
              type="text"
              value={formData.rut}
              onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
              placeholder="12345678-9"
            />

            <ErrorAlert error={error} onDismiss={clearError} />

            <div className="flex space-x-3">
              <SubmitButton loading={loading} loadingText="Saving...">
                Save Changes
              </SubmitButton>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              <div className="flex items-center mt-1">
                {user.is_verified ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    ⚠️ Not Verified
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">{user.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">RUT</label>
              <p className="mt-1 text-sm text-gray-900">{user.rut || 'Not provided'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 🔗 Navigation Component with Auth

Create `src/components/layout/Navigation.tsx`:

```typescript
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Navigation() {
  const { user, signOut, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-800">SII API</h1>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <span className="text-sm font-medium">{user.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </a>
                    <a
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </a>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a
                  href="/signin"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}
```

These components provide a complete, production-ready authentication system that integrates seamlessly with your SII API v2 backend. The components include proper error handling, loading states, validation, and accessibility features.