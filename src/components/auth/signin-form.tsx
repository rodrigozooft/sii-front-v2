'use client'

import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Space, Divider, Checkbox } from 'antd'
import { MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import sanitizeHtml from 'sanitize-html'
import SocialLoginButtons from './social-login-buttons'
// import { useTranslations } from 'next-intl' // Temporarily disabled for build

const { Title, Text } = Typography

// Sign-in validation schema
function createSigninFormSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t('errors.invalidEmail')),
    password: z.string().min(1, t('errors.passwordRequired')),
    rememberMe: z.boolean().default(false),
  })
}

type SigninFormData = {
  email: string
  password: string
  rememberMe: boolean
}

export default function SigninForm(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const router = useRouter()
  const { login, isLoading: authLoading } = useAuthStore()
  // Temporary fix for build - will be properly configured later
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Sign In',
      'subtitle': 'Access your account',
      'email': 'Email',
      'phone': 'Phone',
      'emailPlaceholder': 'Enter your email',
      'passwordPlaceholder': 'Enter your password',
      'rememberMe': 'Remember me',
      'forgotPassword': 'Forgot password?',
      'signInButton': 'Sign In',
      'orContinueWith': 'Or continue with',
      'noAccount': "Don't have an account?",
      'signUp': 'Sign up',
      'phoneLoginTitle': 'Phone Login',
      'phoneLoginSubtitle': 'Coming soon',
      'useEmailInstead': 'Use email instead',
      'success.welcome': 'Welcome back!',
      'errors.invalidEmail': 'Invalid email format',
      'errors.passwordRequired': 'Password is required',
      'errors.loginFailed': 'Login failed. Please try again.'
    }
    return translations[key] || key
  }

  const SigninFormSchema = createSigninFormSchema(t)
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(SigninFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  })

  const onSubmit = async (data: SigninFormData): Promise<void> => {
    if (isLoading || authLoading) return

    setIsLoading(true)
    
    try {
      // Sanitize email input
      const sanitizedEmail = sanitizeHtml(data.email.toLowerCase().trim(), { 
        allowedTags: [], 
        allowedAttributes: {} 
      })
      
      await login(sanitizedEmail, data.password)
      
      // Handle remember me
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
      
      message.success(t('success.welcome'))
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : t('errors.loginFailed')
      message.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 420,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ marginBottom: '8px', color: '#1890ff' }}>
            {t('title')}
          </Title>
          <Text type="secondary">
            {t('subtitle')}
          </Text>
        </div>

        {/* Login Method Tabs */}
        <div style={{ marginBottom: '24px' }}>
          <Space size="small" style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              type={loginMethod === 'email' ? 'primary' : 'default'}
              icon={<MailOutlined />}
              onClick={() => setLoginMethod('email')}
              style={{ flex: 1 }}
            >
              {t('email')}
            </Button>
            <Button
              type={loginMethod === 'phone' ? 'primary' : 'default'}
              icon={<PhoneOutlined />}
              onClick={() => setLoginMethod('phone')}
              style={{ flex: 1 }}
            >
              {t('phone')}
            </Button>
          </Space>
        </div>

        {loginMethod === 'email' ? (
          <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Form.Item 
                    validateStatus={errors.email ? 'error' : ''}
                    help={errors.email?.message}
                  >
                    <Input
                      {...field}
                      prefix={<MailOutlined />}
                      placeholder={t('emailPlaceholder')}
                      size="large"
                      type="email"
                      autoComplete="email"
                    />
                  </Form.Item>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Form.Item 
                    validateStatus={errors.password ? 'error' : ''}
                    help={errors.password?.message}
                  >
                    <Input.Password
                      {...field}
                      prefix={<LockOutlined />}
                      placeholder={t('passwordPlaceholder')}
                      size="large"
                      autoComplete="current-password"
                    />
                  </Form.Item>
                )}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <Checkbox {...field} checked={field.value}>
                      {t('rememberMe')}
                    </Checkbox>
                  )}
                />
                <Link href="/auth/forgot-password" style={{ color: '#1890ff' }}>
                  {t('forgotPassword')}
                </Link>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading || authLoading}
                disabled={!isValid}
                style={{ 
                  width: '100%',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {t('signInButton')}
              </Button>

              <Divider plain>
                <Text type="secondary">{t('orContinueWith')}</Text>
              </Divider>

              <SocialLoginButtons 
                isLoading={isLoading} 
                onLoadingChange={setIsLoading}
              />

              <div style={{ textAlign: 'center' }}>
                <Text type="secondary">
                  {t('noAccount')}{' '}
                  <Link href="/auth/signup" style={{ color: '#1890ff', fontWeight: '500' }}>
                    {t('signUp')}
                  </Link>
                </Text>
              </div>
            </Space>
          </Form>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <PhoneOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={4}>{t('phoneLoginTitle')}</Title>
            <Text type="secondary">
              {t('phoneLoginSubtitle')}
            </Text>
            <div style={{ marginTop: '24px' }}>
              <Button type="link" onClick={() => setLoginMethod('email')}>
                {t('useEmailInstead')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}