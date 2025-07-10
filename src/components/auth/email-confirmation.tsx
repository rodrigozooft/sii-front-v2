'use client'

import React, { useState, useEffect } from 'react'
import { Card, Typography, Button, Result, Space, message, Spin } from 'antd'
import { MailOutlined, CheckCircleOutlined, ReloadOutlined, BuildOutlined } from '@ant-design/icons'
import { useRouter } from '@/i18n/config'
import { useTranslations } from 'next-intl'
import { authApi } from '@/lib/api/auth'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

const { Title, Text, Paragraph } = Typography

export default function EmailConfirmation(): React.JSX.Element {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const router = useRouter()
  const t = useTranslations()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const { user, isAuthenticated } = useAuthStore()

  // Check email verification status and handle onboarding flow
  useEffect(() => {
    const checkEmailStatus = async () => {
      if (!isAuthenticated || !user) return

      try {
        setIsCheckingStatus(true)
        // Get updated user profile to check verification status
        const profile = await authApi.getProfile()
        
        if (profile.is_verified) {
          setEmailVerified(true)
          // Email is verified, proceed with onboarding flow
          message.success(t('auth.emailConfirmation.verified'))
          
          // TODO: Check if user has company and redirect accordingly
          // For now, redirect to company creation (using localized routing)
          setTimeout(() => {
            router.push('/companies/create')
          }, 2000)
        }
      } catch (error) {
        console.error('Error checking email status:', error)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    // Check immediately if user is already authenticated
    if (isAuthenticated) {
      checkEmailStatus()
    }

    // Set up interval to check email verification status every 5 seconds
    const interval = setInterval(checkEmailStatus, 5000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user, router, t])

  const handleResendEmail = async (): Promise<void> => {
    if (isResending) return
    
    setIsResending(true)
    try {
      await authApi.resendVerificationEmail()
      setResendSuccess(true)
      message.success(t('auth.emailConfirmation.resendSuccess'))
    } catch (error) {
      console.error('Resend email error:', error)
      message.error(t('auth.emailConfirmation.resendError'))
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToLogin = (): void => {
    router.push('/auth/signin')
  }

  const handleProceedToCompany = (): void => {
    router.push('/companies/create')
  }

  // Show verified state when email is confirmed
  if (emailVerified) {
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
            maxWidth: 500,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '72px' }} />}
            title={t('auth.emailConfirmation.verifiedTitle')}
            subTitle={
              <Space direction="vertical" size="middle">
                <Paragraph>
                  {t('auth.emailConfirmation.verifiedMessage')}
                </Paragraph>
                <Paragraph type="secondary">
                  {t('auth.emailConfirmation.nextStepCompany')}
                </Paragraph>
              </Space>
            }
            extra={[
              <Button
                key="proceed"
                type="primary"
                size="large"
                icon={<BuildOutlined />}
                onClick={handleProceedToCompany}
                style={{ width: '100%' }}
              >
                {t('auth.emailConfirmation.createCompany')}
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
          maxWidth: 500,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderRadius: '12px',
          textAlign: 'center'
        }}
      >
        <Result
          icon={<MailOutlined style={{ color: '#1890ff' }} />}
          title={t('auth.emailConfirmation.title')}
          subTitle={
            <Space direction="vertical" size="middle">
              <Paragraph>
                {t('auth.emailConfirmation.message')}
              </Paragraph>
              {email && (
                <Text strong style={{ color: '#1890ff' }}>
                  {email}
                </Text>
              )}
              <Paragraph type="secondary">
                {t('auth.emailConfirmation.checkInbox')}
              </Paragraph>
              {isCheckingStatus && (
                <Space>
                  <Spin size="small" />
                  <Text type="secondary">
                    {t('auth.emailConfirmation.checking')}
                  </Text>
                </Space>
              )}
            </Space>
          }
          extra={[
            <Space key="actions" direction="vertical" size="large" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={isResending}
                onClick={handleResendEmail}
                disabled={resendSuccess}
                style={{ width: '100%' }}
              >
                {resendSuccess ? t('auth.emailConfirmation.resendSuccess') : t('auth.emailConfirmation.resendButton')}
              </Button>
              
              <Button
                type="default"
                onClick={handleBackToLogin}
                style={{ width: '100%' }}
              >
                {t('auth.emailConfirmation.backToLogin')}
              </Button>
            </Space>
          ]}
        />
        
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
          <Space direction="vertical" size="small">
            <Text strong style={{ color: '#52c41a' }}>
              <CheckCircleOutlined /> {t('auth.emailConfirmation.accountCreated')}
            </Text>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {t('auth.emailConfirmation.nextSteps')}
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  )
}