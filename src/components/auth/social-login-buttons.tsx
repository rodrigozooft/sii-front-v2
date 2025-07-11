'use client'

import React, { useState } from 'react'
import { Button, Space, message } from 'antd'
import { GoogleOutlined, AppleOutlined, GithubOutlined } from '@ant-design/icons'
import { authApi } from '@/lib/api/auth'
import { useTranslations } from 'next-intl'

interface SocialLoginButtonsProps {
  isLoading?: boolean
  onLoadingChange?: (loading: boolean) => void
}

export default function SocialLoginButtons({ 
  isLoading = false, 
  onLoadingChange 
}: SocialLoginButtonsProps): React.JSX.Element {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const t = useTranslations('auth.signin')

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      setLoadingProvider('google')
      onLoadingChange?.(true)
      
      const { auth_url } = await authApi.getGoogleAuthUrl()
      window.location.href = auth_url
    } catch (error) {
      console.error('Google login error:', error)
      message.error(t('errors.googleLoginFailed'))
    } finally {
      setLoadingProvider(null)
      onLoadingChange?.(false)
    }
  }

  const handleAppleLogin = async (): Promise<void> => {
    message.info('Apple login coming soon!')
  }

  const handleGithubLogin = async (): Promise<void> => {
    message.info('GitHub login coming soon!')
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Button
        size="large"
        icon={<GoogleOutlined />}
        onClick={handleGoogleLogin}
        loading={loadingProvider === 'google' || isLoading}
        disabled={isLoading && loadingProvider !== 'google'}
        style={{ 
          width: '100%',
          height: '48px',
          fontSize: '16px'
        }}
      >
        {t('signInWithGoogle')}
      </Button>
      
      {/* Future social login options */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <Button
            size="large"
            icon={<AppleOutlined />}
            onClick={handleAppleLogin}
            disabled={isLoading}
            style={{ 
              width: '100%',
              height: '48px',
              fontSize: '16px',
              backgroundColor: '#000',
              color: '#fff',
              borderColor: '#000'
            }}
          >
            Sign in with Apple
          </Button>
          
          <Button
            size="large"
            icon={<GithubOutlined />}
            onClick={handleGithubLogin}
            disabled={isLoading}
            style={{ 
              width: '100%',
              height: '48px',
              fontSize: '16px',
              backgroundColor: '#24292e',
              color: '#fff',
              borderColor: '#24292e'
            }}
          >
            Sign in with GitHub
          </Button>
        </>
      )}
    </Space>
  )
}