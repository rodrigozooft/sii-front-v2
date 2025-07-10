import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Empresa - Sistema de Contabilidad SII',
  description: 'Configura tu empresa para comenzar con la gestión contable automatizada',
  keywords: ['empresa', 'contabilidad', 'sii', 'configuración', 'chile'],
}

export default function CreateCompanyPage(): React.JSX.Element {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '20px', color: '#1890ff' }}>
          🏢 Crear Mi Empresa
        </h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          ¡Excelente! Tu correo electrónico está verificado. 
          Ahora configuremos tu empresa para comenzar con la contabilidad automatizada.
        </p>
        <div style={{
          padding: '20px',
          background: '#f0f2f5',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#52c41a' }}>
            🎯 Próximos Pasos del Onboarding
          </h3>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: '10px 0' }}>
              ✅ 1. Crear cuenta de usuario
            </p>
            <p style={{ margin: '10px 0' }}>
              ✅ 2. Verificar correo electrónico
            </p>
            <p style={{ margin: '10px 0', fontWeight: 'bold', color: '#1890ff' }}>
              🔄 3. Crear empresa (en progreso)
            </p>
            <p style={{ margin: '10px 0', color: '#666' }}>
              ⏳ 4. Conectar con SII (Servicio de Impuestos Internos)
            </p>
            <p style={{ margin: '10px 0', color: '#666' }}>
              ⏳ 5. Conectar al menos una cuenta bancaria
            </p>
          </div>
        </div>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Formulario de creación de empresa próximamente...
        </p>
      </div>
    </div>
  )
}