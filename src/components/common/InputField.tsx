import React, { forwardRef } from 'react'

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  required?: boolean
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, required, className = '', ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors'
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
    const inputClasses = `${baseClasses} ${errorClasses} ${className}`

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <input
          ref={ref}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          {...props}
        />
        
        {error && (
          <p 
            id={`${props.id || props.name}-error`}
            className="text-red-500 text-sm"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-gray-500 text-sm">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

InputField.displayName = 'InputField'