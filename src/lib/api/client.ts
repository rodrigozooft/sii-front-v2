import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { z } from 'zod'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

// Create Axios instance with security defaults
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/auth/signin'
    }
    return Promise.reject(error)
  }
)

// Type-safe API wrapper with Zod validation
export async function apiRequest<T>(
  request: () => Promise<AxiosResponse>,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const response = await request()
    return schema.parse(response.data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('API Response validation error:', error.errors)
      throw new Error('Invalid response format from server')
    }
    throw error
  }
}

// Generic types for API responses
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.record(z.unknown()).optional(),
})

export type ApiResponse<T> = {
  success: true
  data: T
  message?: string
}

export type ApiError = {
  success: false
  error: string
  details?: Record<string, unknown>
}