'use client'

import React, { useEffect, useState } from 'react'
import { Card, Result, Button, Spin, Typography, message } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, MailOutlined } from '@ant-design/icons'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth'

const { Title } = Typography

type VerificationStatus = 'verifying' | 'success' | 'error' | 'resend'

export default function EmailVerification(): React.JSX.Element {
  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { user } = useAuthStore()

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('resend')
        return
      }

      try {
        await authApi.verifyEmail(token)
        setStatus('success')
        message.success('Email verified successfully!')
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } catch (error) {
        console.error('Email verification error:', error)
        setStatus('error')
        message.error('Failed to verify email')
      }
    }

    verifyEmail()
  }, [token, router])

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      await authApi.resendVerificationEmail()
      message.success('Verification email resent!')
    } catch (error) {
      console.error('Resend email error:', error)
      message.error('Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Result
            icon={<Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />}
            title="Verifying..."
            subTitle="Please wait while we verify your email address"
          />
        )

      case 'success':
        return (
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            status="success"
            title="Email Verified Successfully!"
            subTitle="Redirecting to dashboard..."
            extra={[
              <Button type="primary" key="dashboard" onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            ]}
          />
        )

      case 'error':
        return (
          <Result
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            status="error"
            title="Verification Failed"
            subTitle="The verification link may have expired or is invalid."
            extra={[
              <Button type="primary" key="resend" onClick={handleResendEmail} loading={isResending}>
                Resend verification email
              </Button>,
              <Button key="signin" onClick={() => router.push('/auth/signin')}>
                Back to Sign In
              </Button>
            ]}
          />
        )

      case 'resend':
        return (
          <Result
            icon={<MailOutlined style={{ color: '#1890ff' }} />}
            title="Verify Email"
            subTitle={user?.email ? `We sent a verification email to ${user.email}` : 'Please verify your email address'}
            extra={[
              <Button type="primary" key="resend" onClick={handleResendEmail} loading={isResending}>
                Resend verification email
              </Button>,
              <Button key="signin" onClick={() => router.push('/auth/signin')}>
                Back to Sign In
              </Button>
            ]}
          />
        )
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
          maxWidth: 520,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ marginBottom: '8px', color: '#1890ff' }}>
            Verify Email
          </Title>
        </div>
        
        {renderContent()}
      </Card>
    </div>
  )
}