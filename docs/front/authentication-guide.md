# Frontend Authentication Implementation Guide

This guide provides complete instructions for implementing user authentication in the frontend application using the SII API v2 backend.

## 🏗️ Authentication Architecture Overview

The API uses a **hybrid Firebase + custom token** authentication approach:

1. **Registration**: Server creates Firebase user and local database record, returns API access token
2. **Sign In**: Client-side Firebase authentication → get Firebase ID token → exchange for API access token
3. **API Calls**: Use API access token for all subsequent requests

### Authentication Flow Diagram

```
Frontend                     Firebase                    SII API v2
   │                           │                           │
   │─── Sign Up ──────────────────────────────────────────▶│
   │                           │          Create user      │
   │                           │◀─────────────────────────▶│
   │◀─────────────── API Access Token + User Data ─────────│
   │                           │                           │
   │─── Sign In ─────────────▶│                           │
   │◀─── Firebase ID Token ───│                           │
   │─── Validate Token ─────────────────────────────────────▶│
   │◀─────────────── API Access Token + User Data ─────────│
```

## 📋 Available API Endpoints

### Base URL
```
http://localhost:8001/api/v1/auth
```

### Core Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| `POST` | `/register` | Create new user account | `RegisterRequest` | `LoginResponse` |
| `POST` | `/login/email` | Get login instructions | `LoginRequest` | `LoginResponse` |
| `POST` | `/validate` | Exchange Firebase token for API token | - | `LoginResponse` |
| `GET` | `/profile` | Get user profile | - | `UserProfile` |

## 🔧 Frontend Setup

### 1. Install Dependencies

```bash
npm install firebase
npm install @types/node  # for TypeScript projects
```

### 2. Firebase Configuration

Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase config from Firebase Console
  apiKey: "your-api-key",
  authDomain: "finsnap-5c12a.firebaseapp.com", // Replace with your domain
  projectId: "finsnap-5c12a",
  storageBucket: "finsnap-5c12a.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

## 📝 TypeScript Interfaces

### Request Types

```typescript
// Registration request
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  rut?: string;
}

// Login request (for Firebase ID token validation)
interface LoginRequest {
  email?: string;
  password?: string;
  id_token?: string;
}
```

### Response Types

```typescript
// Token information
interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  refresh_token?: string;
}

// Main authentication response
interface LoginResponse {
  message: string;
  user?: UserResponse;
  token?: TokenResponse;
  instructions?: Record<string, string>;
}

// User information
interface UserResponse {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
  phone?: string;
  rut?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Extended user profile
interface UserProfile extends UserResponse {
  company_count: number;
  current_company_id?: string;
  last_login?: string;
}
```

## 🔐 Authentication Service

Create `src/services/authService.ts`:

```typescript
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';

const API_BASE = 'http://localhost:8001/api/v1';

class AuthService {
  
  // Register new user
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Sign in with Firebase and get API token
  async signIn(email: string, password: string): Promise<LoginResponse> {
    try {
      // 1. Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      // 3. Exchange for API access token
      const response = await fetch(`${API_BASE}/auth/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Sign in failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      // Clear local storage
      localStorage.removeItem('api_token');
      localStorage.removeItem('user_data');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  // Get user profile
  async getProfile(apiToken: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Listen to Firebase auth state changes
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

export const authService = new AuthService();
```

## ⚛️ React Authentication Context

Create `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService } from '../services/authService';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: UserResponse | null;
  apiToken: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signUp: (userData: RegisterRequest) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    apiToken: null,
    loading: true,
    error: null,
  });

  // Sign up function
  const signUp = async (userData: RegisterRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authService.register(userData);
      
      // Store token and user data
      if (response.token && response.user) {
        localStorage.setItem('api_token', response.token.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        setState(prev => ({
          ...prev,
          user: response.user!,
          apiToken: response.token!.access_token,
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign up failed',
        loading: false,
      }));
      throw error;
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await authService.signIn(email, password);
      
      // Store token and user data
      if (response.token && response.user) {
        localStorage.setItem('api_token', response.token.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        setState(prev => ({
          ...prev,
          user: response.user!,
          apiToken: response.token!.access_token,
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign in failed',
        loading: false,
      }));
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      await authService.signOut();
      setState({
        firebaseUser: null,
        user: null,
        apiToken: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
        loading: false,
      }));
    }
  };

  // Clear error function
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      setState(prev => ({ ...prev, firebaseUser }));
      
      // If user signs out of Firebase, clear everything
      if (!firebaseUser) {
        localStorage.removeItem('api_token');
        localStorage.removeItem('user_data');
        setState(prev => ({
          ...prev,
          user: null,
          apiToken: null,
          loading: false,
        }));
      }
    });

    // Load stored data on app start
    const storedToken = localStorage.getItem('api_token');
    const storedUser = localStorage.getItem('user_data');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setState(prev => ({
          ...prev,
          user: userData,
          apiToken: storedToken,
          loading: false,
        }));
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('api_token');
        localStorage.removeItem('user_data');
        setState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 📋 Sign Up Form Component

Create `src/components/SignUpForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  rut: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  phone?: string;
  rut?: string;
  general?: string;
}

export function SignUpForm() {
  const { signUp, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    rut: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one digit';
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (!name) return 'Name is required';
    if (name.length < 2) return 'Name must be at least 2 characters long';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (phone && !/^\+?[\d\s-()]+$/.test(phone)) {
      return 'Please enter a valid phone number';
    }
    return undefined;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (error) clearError();
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.name = validateName(formData.name);
    newErrors.phone = validatePhone(formData.phone);

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || undefined,
        rut: formData.rut || undefined,
      });
      
      // Success! User will be redirected by your routing logic
    } catch (error) {
      // Error is handled by the context
      console.error('Sign up failed:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Create Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Create a password"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Phone Field (Optional) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+56912345678"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        {/* RUT Field (Optional - Chilean tax ID) */}
        <div>
          <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
            RUT (Chilean Tax ID)
          </label>
          <input
            type="text"
            id="rut"
            name="rut"
            value={formData.rut}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="12345678-9"
          />
        </div>

        {/* General Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-4">
        Already have an account?{' '}
        <a href="/signin" className="text-blue-600 hover:text-blue-500">
          Sign in
        </a>
      </p>
    </div>
  );
}
```

## 🔑 Sign In Form Component

Create `src/components/SignInForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function SignInForm() {
  const { signIn, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (error) clearError();
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await signIn(formData.email, formData.password);
      // Success! User will be redirected by your routing logic
    } catch (error) {
      // Error is handled by the context
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Sign In
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* General Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-sm text-gray-600 mt-4 space-y-2">
        <p>
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:text-blue-500">
            Sign up
          </a>
        </p>
        <p>
          <a href="/forgot-password" className="text-blue-600 hover:text-blue-500">
            Forgot your password?
          </a>
        </p>
      </div>
    </div>
  );
}
```

## 🛡️ Protected Route Component

Create `src/components/ProtectedRoute.tsx`:

```typescript
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">Please sign in to access this page.</p>
        <a href="/signin" className="text-blue-600 hover:text-blue-500">
          Go to Sign In
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
```

## 🔌 API Request Helper

Create `src/utils/apiClient.ts`:

```typescript
// Helper for making authenticated API requests
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8001/api/v1') {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('api_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

## 🚀 Usage Example

Create `src/App.tsx`:

```typescript
import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SignUpForm } from './components/SignUpForm';
import { SignInForm } from './components/SignInForm';
import { ProtectedRoute } from './components/ProtectedRoute';

function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Welcome back!</h2>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Verified:</strong> {user?.is_verified ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();

  // Simple routing logic (replace with your router)
  const path = window.location.pathname;

  if (user) {
    return (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    );
  }

  if (path === '/signup') {
    return <SignUpForm />;
  }

  return <SignInForm />;
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
```

## ⚠️ Common Issues & Solutions

### 1. CORS Errors
Make sure your API server is running with the correct CORS settings for localhost:3000.

### 2. Firebase Configuration
Double-check your Firebase config object and ensure the project ID matches.

### 3. Token Storage
The examples use localStorage for simplicity. Consider using secure storage for production.

### 4. Error Handling
Always handle network errors and provide user-friendly feedback.

### 5. Loading States
Show loading indicators during authentication operations for better UX.

## 🔒 Security Best Practices

1. **Never store sensitive data in localStorage** - Only store non-sensitive tokens
2. **Implement token refresh** - Handle token expiration gracefully
3. **Validate inputs** - Always validate user inputs on both client and server
4. **Use HTTPS in production** - Never use HTTP for authentication in production
5. **Implement proper logout** - Clear all stored data on logout

## 📚 Next Steps

1. Implement password reset functionality
2. Add email verification flow
3. Implement multi-factor authentication
4. Add social login (Google, etc.)
5. Set up proper error monitoring

This guide provides a complete foundation for implementing authentication in your frontend application. Adjust the styling and routing to match your application's architecture.