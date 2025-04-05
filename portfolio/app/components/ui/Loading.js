'use client'

/**
 * Loading component for displaying loading states
 */
const Loading = ({
  size = 'md',
  color = 'primary',
  fullPage = false,
  text = 'Loading...',
  className = '',
  textClassName = '',
}) => {
  const sizeStyles = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }
  
  const colorStyles = {
    primary: 'text-primary-500',
    gray: 'text-gray-500',
    white: 'text-white',
    black: 'text-black',
  }
  
  const textSizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }
  
  // Full page styles
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50">
        <svg
          className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]} ${className}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {text && <p className={`mt-4 ${textSizeStyles[size]} font-medium ${colorStyles[color]} ${textClassName}`}>{text}</p>}
      </div>
    )
  }
  
  // In-place loading spinner
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <p className={`mt-2 ${textSizeStyles[size]} font-medium ${colorStyles[color]} ${textClassName}`}>{text}</p>}
    </div>
  )
}

/**
 * Skeleton loading component for content placeholders
 */
const Skeleton = ({ className = '', width, height }) => {
  const styles = [
    'animate-pulse bg-gray-200 rounded',
    className,
  ].join(' ')
  
  return (
    <div
      className={styles}
      style={{
        width: width,
        height: height,
      }}
    />
  )
}

/**
 * Card skeleton for loading card placeholders
 */
const CardSkeleton = ({ className = '', rows = 3 }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 rounded mb-2.5"></div>
      ))}
    </div>
  )
}

/**
 * Table skeleton for loading table placeholders
 */
const TableSkeleton = ({ rows = 5, cols = 4, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-8 bg-gray-200 rounded mb-4"></div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-6 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  )
}

Loading.Skeleton = Skeleton
Loading.CardSkeleton = CardSkeleton
Loading.TableSkeleton = TableSkeleton

export default Loading 