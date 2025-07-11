import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef'
}

// Initialize Firebase lazily
let app: FirebaseApp | null = null
let auth: Auth | null = null

// Function to initialize Firebase (only in browser environment)
const initializeFirebase = (): FirebaseApp => {
  if (app) return app
  
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized in browser environment')
  }
  
  app = initializeApp(firebaseConfig)
  return app
}

// Function to get Firebase Auth (only in browser environment)
const getFirebaseAuth = (): Auth => {
  if (auth) return auth
  
  // Only initialize in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be initialized in browser environment')
  }
  
  const firebaseApp = initializeFirebase()
  auth = getAuth(firebaseApp)
  
  // Connect to Firebase Auth emulator in development
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099')
  }
  
  return auth
}

// Export auth getter instead of direct auth instance
export { getFirebaseAuth as auth }

// Export app getter
export const getFirebaseApp = (): FirebaseApp => {
  return initializeFirebase()
}

export default getFirebaseApp

// Type-safe Firebase configuration check
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  )
}

// Helper to get Firebase error messages
export const getFirebaseErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password is too weak',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid credentials',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/popup-closed-by-user': 'Sign-in popup was closed',
  }

  return errorMessages[code] || 'An unexpected error occurred'
}