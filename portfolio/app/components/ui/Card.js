'use client'

import { forwardRef } from 'react'

/**
 * Card component for displaying content in a contained card format
 */
const Card = forwardRef(({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = false,
  hover = false,
  onClick,
  ...props
}, ref) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }
  
  const shadowStyles = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  }
  
  const borderStyles = border ? 'border border-gray-200' : ''
  const hoverStyles = hover ? 'transition-transform duration-200 hover:scale-105 hover:shadow-lg' : ''
  const clickableStyles = onClick ? 'cursor-pointer' : ''
  
  const styles = [
    'bg-white rounded-lg',
    paddingStyles[padding],
    shadowStyles[shadow],
    borderStyles,
    hoverStyles,
    clickableStyles,
    className,
  ].join(' ')
  
  return (
    <div
      className={styles}
      onClick={onClick}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

/**
 * Card.Header component for card headers
 */
function CardHeader({ children, className = '', divided = false, ...props }) {
  const dividerStyles = divided ? 'border-b border-gray-200 pb-3 mb-4' : ''
  
  return (
    <div className={`${dividerStyles} ${className}`} {...props}>
      {children}
    </div>
  )
}

/**
 * Card.Body component for card body content
 */
function CardBody({ children, className = '', ...props }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

/**
 * Card.Footer component for card footers
 */
function CardFooter({ children, className = '', divided = false, ...props }) {
  const dividerStyles = divided ? 'border-t border-gray-200 pt-4 mt-4' : ''
  
  return (
    <div className={`${dividerStyles} ${className}`} {...props}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card 