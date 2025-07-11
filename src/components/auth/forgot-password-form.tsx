'use client'

import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Space, Result } from 'antd'
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import sanitizeHtml from 'sanitize-html'

const { Title, Text } = Typography

// Forgot password validation schema
const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordForm(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    }
  })

  const onSubmit = async (data: ForgotPasswordFormData): Promise<void> => {
    if (isLoading) return

    setIsLoading(true)
    
    try {
      // Sanitize email input
      const sanitizedEmail = sanitizeHtml(data.email.toLowerCase().trim(), { 
        allowedTags: [], 
        allowedAttributes: {} 
      })
      
      await authApi.forgotPassword(sanitizedEmail)
      message.success('Password reset instructions sent! Check your email.')
      setIsSuccess(true)
    } catch (error) {
      console.error('Forgot password error:', error)
      message.error('Failed to send password reset instructions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
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
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Instructions Sent!"
            subTitle="Check your email for password reset instructions"
            extra={[
              <Button 
                type="primary" 
                key="signin"
                onClick={() => router.push('/auth/signin')}
              >
                Back to Sign In
              </Button>
            ]}
          />
        </Card>
      </div>
    )
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
            Forgot Your Password?
          </Title>
          <Text type="secondary">
            No worries, we&apos;ll send you reset instructions
          </Text>
        </div>

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
                    placeholder="Email Address"
                    size="large"
                    type="email"
                    autoComplete="email"
                  />
                </Form.Item>
              )}
            />

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              disabled={!isValid}
              style={{ 
                width: '100%',
                height: '48px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Send Instructions
            </Button>

            <div style={{ textAlign: 'center' }}>
              <Link href="/auth/signin" style={{ color: '#1890ff', fontWeight: '500' }}>
                Back to Sign In
              </Link>
            </div>
          </Space>
        </Form>
      </Card>
    </div>
  )
}