'use client'

import { forwardRef } from 'react'

/**
 * Input component for form inputs with various styling options
 */
const Input = forwardRef(({
  className = '',
  type = 'text',
  label,
  error,
  id,
  name,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  size = 'md',
  prefix,
  suffix,
  helperText,
  fullWidth = false,
  onChange,
  onBlur,
  ...props
}, ref) => {
  // Generate ID if not provided
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 11)}`
  
  const sizeStyles = {
    sm: 'h-8 text-sm px-2',
    md: 'h-10 px-3',
    lg: 'h-12 text-lg px-4',
  }
  
  const baseStyles = [
    'block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
    sizeStyles[size],
    disabled ? 'bg-gray-100 cursor-not-allowed' : '',
    readOnly ? 'bg-gray-50 cursor-default' : '',
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ')
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`relative rounded-md shadow-sm ${fullWidth ? 'w-full' : ''}`}>
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        
        <input
          type={type}
          id={inputId}
          name={name}
          className={baseStyles}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          style={prefix ? { paddingLeft: '2rem' } : {}}
          {...props}
        />
        
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input 