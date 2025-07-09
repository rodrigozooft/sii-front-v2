'use client'

import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Space, Divider } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/config'
import { useAuthStore } from '@/store/auth'
import { RutSchema, formatRut, cleanRut, ChileanPhoneSchema } from '@/utils/chile'
import sanitizeHtml from 'sanitize-html'

const { Title, Text } = Typography

// Enhanced validation schema with Chilean-specific rules
const createSignupFormSchema = (t: any) => z.object({
  email: z.string().email(t('auth.signup.errors.emailInvalid')),
  password: z
    .string()
    .min(8, t('auth.signup.errors.passwordMinLength'))
    .regex(/[A-Z]/, t('auth.signup.errors.passwordUppercase'))
    .regex(/[a-z]/, t('auth.signup.errors.passwordLowercase'))
    .regex(/\d/, t('auth.signup.errors.passwordNumber'))
    .regex(/[^A-Za-z0-9]/, t('auth.signup.errors.passwordSpecial')),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .min(1, t('auth.signup.errors.firstNameRequired'))
    .max(50, t('auth.signup.errors.firstNameLength'))
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, t('auth.signup.errors.firstNameInvalid')),
  lastName: z
    .string()
    .min(1, t('auth.signup.errors.lastNameRequired'))
    .max(50, t('auth.signup.errors.lastNameLength'))
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, t('auth.signup.errors.lastNameInvalid')),
  rut: RutSchema,
  phone: ChileanPhoneSchema.optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.signup.errors.passwordsNoMatch'),
  path: ["confirmPassword"],
})

export default function SignupForm(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register, isLoading: authLoading } = useAuthStore()
  const t = useTranslations()

  const SignupFormSchema = createSignupFormSchema(t)
  type SignupFormData = z.infer<typeof SignupFormSchema>

  const {
    control,
    handleSubmit,
    // watch, // For future use with password validation
    setValue,
    formState: { errors, isValid }
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      rut: '',
      phone: '',
    }
  })

  const handleRutChange = (value: string): void => {
    // Sanitize input to prevent XSS
    const sanitizedValue = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
    const cleanedRut = cleanRut(sanitizedValue)
    const formattedRut = formatRut(cleanedRut)
    setValue('rut', formattedRut, { shouldValidate: true })
  }

  const onSubmit = async (data: SignupFormData): Promise<void> => {
    if (isLoading || authLoading) return

    setIsLoading(true)
    
    try {
      // Sanitize all inputs before sending
      const sanitizedData = {
        email: sanitizeHtml(data.email.toLowerCase().trim(), { allowedTags: [], allowedAttributes: {} }),
        password: data.password, // Don't sanitize password, but validate it
        first_name: sanitizeHtml(data.firstName.trim(), { allowedTags: [], allowedAttributes: {} }),
        last_name: sanitizeHtml(data.lastName.trim(), { allowedTags: [], allowedAttributes: {} }),
        rut: cleanRut(data.rut),
        ...(data.phone && { phone: sanitizeHtml(data.phone.replace(/\s/g, ''), { allowedTags: [], allowedAttributes: {} }) }),
      }

      await register(sanitizedData)
      message.success(t('auth.signup.success'))
      router.push('/dashboard')
    } catch (error) {
      console.error('Signup error:', error)
      const errorMessage = error instanceof Error ? error.message : t('auth.signup.errors.registrationFailed')
      message.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // const passwordValue = watch('password') // For future password strength indicator

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
          maxWidth: 480,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ marginBottom: '8px', color: '#1890ff' }}>
            {t('auth.signup.title')}
          </Title>
          <Text type="secondary">
            {t('auth.signup.subtitle')}
          </Text>
        </div>

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Personal Information */}
            <div>
              <Text strong>Personal Information</Text>
              <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: '12px' }}>
                <Space.Compact style={{ width: '100%' }}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <Form.Item 
                        style={{ width: '50%', marginBottom: 0 }}
                        validateStatus={errors.firstName ? 'error' : ''}
                        help={errors.firstName?.message}
                      >
                        <Input
                          {...field}
                          prefix={<UserOutlined />}
                          placeholder="First Name"
                          size="large"
                          maxLength={50}
                        />
                      </Form.Item>
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <Form.Item 
                        style={{ width: '50%', marginBottom: 0 }}
                        validateStatus={errors.lastName ? 'error' : ''}
                        help={errors.lastName?.message}
                      >
                        <Input
                          {...field}
                          placeholder="Last Name"
                          size="large"
                          maxLength={50}
                        />
                      </Form.Item>
                    )}
                  />
                </Space.Compact>

                <Controller
                  name="rut"
                  control={control}
                  render={({ field }) => (
                    <Form.Item 
                      validateStatus={errors.rut ? 'error' : ''}
                      help={errors.rut?.message}
                    >
                      <Input
                        {...field}
                        onChange={(e) => handleRutChange(e.target.value)}
                        prefix={<IdcardOutlined />}
                        placeholder="Chilean RUT (e.g., 12.345.678-9)"
                        size="large"
                        maxLength={12}
                      />
                    </Form.Item>
                  )}
                />
              </Space>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Contact Information */}
            <div>
              <Text strong>Contact Information</Text>
              <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: '12px' }}>
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
                        placeholder="Email Address"
                        size="large"
                        type="email"
                        autoComplete="email"
                      />
                    </Form.Item>
                  )}
                />

                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Form.Item 
                      validateStatus={errors.phone ? 'error' : ''}
                      help={errors.phone?.message}
                    >
                      <Input
                        {...field}
                        prefix={<PhoneOutlined />}
                        placeholder="Phone Number (optional, +56912345678)"
                        size="large"
                        type="tel"
                      />
                    </Form.Item>
                  )}
                />
              </Space>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Security */}
            <div>
              <Text strong>Security</Text>
              <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: '12px' }}>
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
                        placeholder="Password"
                        size="large"
                        autoComplete="new-password"
                      />
                    </Form.Item>
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Form.Item 
                      validateStatus={errors.confirmPassword ? 'error' : ''}
                      help={errors.confirmPassword?.message}
                    >
                      <Input.Password
                        {...field}
                        prefix={<LockOutlined />}
                        placeholder="Confirm Password"
                        size="large"
                        autoComplete="new-password"
                      />
                    </Form.Item>
                  )}
                />
              </Space>
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
              Create Account
            </Button>

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Already have an account?{' '}
                <Link href="/auth/signin" style={{ color: '#1890ff', fontWeight: '500' }}>
                  Sign in
                </Link>
              </Text>
            </div>
          </Space>
        </Form>
      </Card>
    </div>
  )
}