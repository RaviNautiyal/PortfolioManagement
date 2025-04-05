'use client'

import { forwardRef } from 'react'
import Link from 'next/link'

const variantStyles = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
}

const sizeStyles = {
  xs: 'text-xs py-1 px-2',
  sm: 'text-sm py-1.5 px-3',
  md: 'text-sm py-2 px-4',
  lg: 'text-base py-2.5 px-5',
  xl: 'text-base py-3 px-6',
}

/**
 * Button component that can be rendered as a button or link
 */
const Button = forwardRef(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  href,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  rounded = false,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const roundedStyles = rounded ? 'rounded-full' : 'rounded-md'
  const widthStyles = fullWidth ? 'w-full' : ''
  
  const styles = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    roundedStyles,
    widthStyles,
    className,
  ].join(' ')
  
  // If loading, show loading spinner
  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </>
  )
  
  // If href is provided, render as Link
  if (href) {
    return (
      <Link
        href={href}
        className={styles}
        ref={ref}
        {...props}
      >
        {content}
      </Link>
    )
  }
  
  // Otherwise render as button
  return (
    <button
      type={type}
      className={styles}
      disabled={disabled || loading}
      onClick={onClick}
      ref={ref}
      {...props}
    >
      {content}
    </button>
  )
})

Button.displayName = 'Button'

export default Button 