import { useState } from 'react'

interface UseAuthFormProps<T> {
  initialValues: T
  validate: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => Promise<void>
}

export function useAuthForm<T>({
  initialValues,
  validate,
  onSubmit
}: UseAuthFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (name: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validate(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit(values)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const clearErrors = () => {
    setErrors({})
    setSubmitError(null)
  }

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    clearErrors,
    setValues
  }
}