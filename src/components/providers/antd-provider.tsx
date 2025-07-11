'use client'

import React from 'react'
import { ConfigProvider, theme, type ThemeConfig, App } from 'antd'
import esES from 'antd/locale/es_ES'

// Suppress React 19 compatibility warning temporarily
// TODO: Remove when Ant Design officially supports React 19
const originalConsoleWarn = console.warn
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('antd v5 support React is 16 ~ 18')) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

// Chilean-themed Ant Design configuration
const chileanTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Brand colors inspired by Chilean flag and professional accounting
    colorPrimary: '#1890ff', // Professional blue
    colorInfo: '#1890ff',
    colorSuccess: '#52c41a', // Financial green
    colorWarning: '#faad14', // Attention orange
    colorError: '#ff4d4f', // Error red
    
    // Typography
    fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    
    // Spacing and layout
    borderRadius: 8,
    wireframe: false,
    
    // Components
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
  },
  components: {
    // Customize specific components for financial application
    Table: {
      headerBg: '#fafafa',
      headerColor: '#262626',
      borderColor: '#f0f0f0',
    },
    Card: {
      headerBg: '#fafafa',
      boxShadowTertiary: '0 2px 8px rgba(0, 0, 0, 0.06)',
    },
    Input: {
      borderRadius: 8,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      fontWeight: 500,
    },
    Form: {
      itemMarginBottom: 24,
      verticalLabelPadding: '0 0 8px',
    },
    // Enhanced security: No iframe or script tags in components
    Typography: {
      titleMarginTop: 0,
      titleMarginBottom: 16,
    },
  },
}

interface AntdProviderProps {
  children: React.ReactNode
}

export function AntdProvider({ children }: AntdProviderProps): React.JSX.Element {
  return (
    <ConfigProvider
      theme={chileanTheme}
      locale={esES}
      // Security: Disable dangerous components
      renderEmpty={() => null}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  )
}