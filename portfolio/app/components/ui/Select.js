'use client'

import { forwardRef } from 'react'

/**
 * Select component for dropdown selections in forms
 */
const Select = forwardRef(({
  className = '',
  label,
  error,
  id,
  name,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  size = 'md',
  options = [],
  fullWidth = false,
  helperText,
  onChange,
  onBlur,
  value,
  ...props
}, ref) => {
  // Generate ID if not provided
  const selectId = id || name || `select-${Math.random().toString(36).substring(2, 11)}`
  
  const sizeStyles = {
    sm: 'h-8 text-sm pl-3 pr-8',
    md: 'h-10 pl-3 pr-10',
    lg: 'h-12 text-lg pl-4 pr-10',
  }
  
  const baseStyles = [
    'block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
    sizeStyles[size],
    disabled ? 'bg-gray-100 cursor-not-allowed' : '',
    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : '',
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ')
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          name={name}
          className={baseStyles}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          value={value}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => {
            const { value, label } = typeof option === 'object'
              ? option
              : { value: option, label: option }
            
            return (
              <option key={value} value={value}>
                {label}
              </option>
            )
          })}
        </select>
        
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select 